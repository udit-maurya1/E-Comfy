# ECOMFY

A full-stack storefront: product catalogue with variants, cart, saved addresses,
and Razorpay checkout. Built with Express + MongoDB on the back and React +
Redux Toolkit on the front.

Every commerce rule a store owner would want to change — currency, shipping fee,
free-shipping threshold, tax rate — lives in one config file, and the payment
gateway sits behind a single module you can swap.

---

## Features

- **Auth** — email/password and Google OAuth, JWT in an httpOnly cookie
- **Products** — seller-owned catalogue with per-variant images, price and stock
- **Cart** — server-side aggregation; totals are computed by the API, never the browser
- **Wishlist** — works signed out via localStorage, merges into the account on sign-in
- **Addresses** — multiple saved addresses per user, one default, pick at checkout
- **Payments** — Razorpay orders, signature verification, webhook reconciliation
- **Orders** — immutable snapshots of items and delivery address, order history

---

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20.19+ or 22.12+ |
| API | Express 5, Mongoose 9 |
| Auth | JWT (httpOnly cookie), Passport Google OAuth 2.0 |
| Payments | Razorpay |
| Media | ImageKit |
| Frontend | React 19, Redux Toolkit, React Router 8, Vite, Tailwind 4, GSAP |
| Tests | Vitest + Supertest |

---

## Quick start

```bash
git clone <your-fork-url> ecomfy && cd ecomfy

# Backend
cd backend
npm install
cp .env.example .env      # fill in the values — see below
npm run seed              # optional: sample products
npm run dev               # http://localhost:8080

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev               # http://localhost:5173
```

You need a MongoDB instance reachable at `MONGO_URI` — local `mongod`, Docker,
or Atlas all work.

Vite proxies `/api` to `http://localhost:8080`, so the frontend needs no
API-base configuration in development. Change the target in
[`frontend/vite.config.js`](frontend/vite.config.js) if your API runs elsewhere.

---

## Configuration

All backend config is environment-driven. See
[`backend/.env.example`](backend/.env.example) for the full annotated list.

**Required** — the server refuses to boot without these:

| Variable | Notes |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string; rotating it logs everyone out |
| `PORT` | API port |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud → APIs & Services → Credentials |
| `RAZOR_PAY_KEY` / `RAZOR_PAY_SECRET` | Razorpay Dashboard → Settings → API Keys |
| `CLIENT_URL` | Required in production only; defaults to `http://localhost:5173` |

**Recommended:**

| Variable | Notes |
|---|---|
| `RAZOR_PAY_WEBHOOK_SECRET` | Without it, webhooks are rejected and only the browser callback confirms payments |

**Storefront rules** — optional, defaults in
[`backend/src/config/commerce.js`](backend/src/config/commerce.js):

| Variable | Default | Meaning |
|---|---|---|
| `CURRENCY` | `INR` | Charge currency |
| `SHIPPING_FEE` | `99` | Flat fee below the threshold |
| `FREE_SHIPPING_THRESHOLD` | `999` | Subtotal at which shipping is waived |
| `TAX_RATE` | `0` | Fraction, e.g. `0.18` for 18% GST |
| `MAX_ADDRESSES_PER_USER` | `10` | Address book cap |
| `MAX_WISHLIST_ITEMS` | `100` | Wishlist cap, also bounds a guest merge |

### Razorpay webhook

Point a webhook at `<public-url>/api/payment/webhook` and subscribe to
`payment.captured`, `payment.failed` and `refund.processed`. Locally, expose
your port with a tunnel (`ngrok http 8080`) and use that URL.

The webhook — not the browser — is the source of truth for payment state. A
buyer who closes the tab mid-redirect still gets their order confirmed.

---

## API

All routes are prefixed with `/api`. Private routes read the JWT from the
`token` cookie.

### Auth — `/api/auth`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/register` | Public | Create an account |
| POST | `/login` | Public | Start a session |
| GET | `/google` | Public | Begin Google OAuth |
| GET | `/google/callback` | Public | OAuth return; redirects to `CLIENT_URL/auth/callback` |
| GET | `/me` | Private | Current user |

### Products — `/api/product`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/all` | Public | Paginated catalogue |
| GET | `/get-product/:id` | Private | Single product |
| POST | `/create` | Seller | Create a product (multipart, ≤5 images) |
| POST | `/:id/variant` | Seller | Add a variant with its own price/stock |
| PUT | `/update/:id` | Seller | Update a product |
| GET | `/get-products-seller` | Seller | The seller's own products |

### Cart — `/api/cart`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/items` | Private | Cart with server-computed `amounts` |
| POST | `/add/:productId/:variantId` | Private | Add, stock-checked |
| PUT | `/update/:itemId` | Private | Change quantity |
| DELETE | `/remove/:itemId` | Private | Remove a line |

### Wishlist — `/api/wishlist`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | Private | Saved items, products populated |
| POST | `/:productId` | Private | Save (optional `variantId` in body) |
| DELETE | `/:productId` | Private | Unsave |
| POST | `/merge` | Private | Fold a guest's localStorage list into the account |

Signed-out visitors never touch these routes — their wishlist lives in
localStorage (`ecomfy.wishlist.v1`) and is pushed to `/merge` once, right after
sign-in. See [How the wishlist works](#how-the-wishlist-works).

### Addresses — `/api/address`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | Private | List, default first |
| POST | `/` | Private | Add (first one becomes default) |
| PUT | `/:addressId` | Private | Partial update |
| DELETE | `/:addressId` | Private | Delete; promotes a new default |
| PATCH | `/:addressId/default` | Private | Set default |

### Payments — `/api/payment`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/order` | Private | Create an order from the cart; returns Razorpay checkout params |
| POST | `/verify` | Private | Verify the checkout signature and confirm |
| POST | `/failed` | Private | Record an abandoned or failed attempt |
| GET | `/orders` | Private | Order history |
| GET | `/orders/:orderId` | Private | One order |
| POST | `/webhook` | HMAC | Razorpay server-to-server events |

---

## How checkout works

```
Cart  ──▶  POST /api/payment/order   ──▶  Order (payment.status = created)
              │  server re-reads the cart, re-checks stock,
              │  computes the total, opens a Razorpay order
              ▼
        Razorpay modal in the browser
              │
    ┌─────────┴──────────┐
    ▼                    ▼
POST /verify        POST /webhook          both call finalizePaidOrder()
(fast path)         (source of truth)      → status = paid
                                           → stock decremented
                                           → cart cleared
```

`finalizePaidOrder` returns early if the order is already paid, so the two paths
can race without double-charging stock.

**The client never sends an amount.** `POST /api/payment/order` accepts only an
`addressId`; the total is recomputed server-side from the cart. Cart responses
carry that same breakdown as `cart.amounts`, so what the buyer sees and what
Razorpay charges come from one calculation.

---

## How the wishlist works

A visitor can save items before they have an account. There are two stores, and
`useWishlist` picks between them on every call so no component has to care:

```
signed out ──▶ localStorage "ecomfy.wishlist.v1"
                  │  entries carry a small product snapshot
                  │  (title, one image, price) so the page renders
                  │  with no API to ask
                  ▼
             user signs in
                  │
                  ▼
        POST /api/wishlist/merge  ── union, never overwrite
                  │  ids only; the server re-reads the real products,
                  │  skips dead ones, caps at MAX_WISHLIST_ITEMS
                  ▼
signed in  ──▶ MongoDB, localStorage cleared
```

The merge fires from a single effect in [`App.jsx`](frontend/src/app/App.jsx)
that watches the auth user, so it covers login, register, Google OAuth and a
plain refresh identically. It's idempotent — re-sending the same ids changes
nothing — and if it fails the local copy is kept rather than dropped, so saved
items survive to the next sign-in.

---

## Security notes

- Session JWT is `httpOnly` — no script on the page can read it. `secure` and
  `sameSite=none` switch on when `NODE_ENV=production`.
- Razorpay signatures are compared with `crypto.timingSafeEqual`.
- The webhook HMAC is computed over the raw request bytes, captured in
  [`app.js`](backend/src/app.js) via `express.json({ verify })`.
- Stock is decremented with a guarded `arrayFilters` update that refuses to go
  below zero, so concurrent buyers can't both take the last unit.
- Every address and order query is scoped by `user`, so one account can never
  read or mutate another's records.

---

## Testing

```bash
cd backend
npm test
```

Integration tests run against a real MongoDB (`ecomfy_test_<worker>`), with
Razorpay stubbed so no live API call is made. They cover cart aggregation,
address ownership isolation, forged-signature rejection, payment idempotency,
and webhook-only confirmation.

---

## Project layout

```
backend/src
├── config/        env + commerce rules
├── models/        Mongoose schemas
├── dao/           reusable queries and aggregation pipelines
├── services/      external integrations (Razorpay, ImageKit)
├── controllers/   request handling
├── routes/        endpoint wiring
├── validator/     express-validator chains
└── __tests__/     Vitest + Supertest

frontend/src
├── app/           store, router, root component
├── components/    shared UI (StoreNav, ThemeToggle, ErrorBoundary)
├── hooks/         shared hooks
└── features/<name>/
    ├── services/  axios calls
    ├── state/     Redux slice
    ├── hooks/     the API the pages use
    ├── pages/     routed screens
    └── components/
```

---

## Swapping the payment gateway

[`backend/src/services/payment.service.js`](backend/src/services/payment.service.js)
is the only file that imports the Razorpay SDK. Reimplement its four exports —
`createPaymentOrder`, `verifyPaymentSignature`, `verifyWebhookSignature` and
`fetchPayment` — and the rest of the app is unchanged.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) — free for commercial use, modification and redistribution.
