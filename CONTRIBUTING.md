# Contributing to ECOMFY

Thanks for taking the time. This file covers how to get set up, what the code
should look like, and what has to be true before a change lands.

---

## Getting set up

Follow the quick start in [README.md](README.md). You'll need Node.js 20.19+ (or
22.12+) and a MongoDB instance.

For anything touching payments, use Razorpay **test** keys (`rzp_test_…`). Never
put live keys in a branch, a test fixture, or an issue.

---

## Before you open a pull request

```bash
cd backend  && npm test          # all tests must pass
cd frontend && npm run lint      # no new errors
cd frontend && npm run build     # must build clean
```

A PR that changes backend behaviour needs a test that fails without the change.

---

## Code style

The codebase has strong conventions. Match the file you're editing rather than
introducing a new pattern.

**Backend** — layered, and each layer stays in its lane:

```
route → middleware (auth) → validator → controller → dao/service → model
```

- ES modules, `.js` extensions in every import path
- Controllers carry a JSDoc header: `@desc`, `@route`, `@access`
- Controllers `try/catch`, `console.error(error)`, and return
  `{ message }` with a sensible status. They don't `throw` to Express.
- Queries that outlive one controller belong in `dao/`; anything that talks to a
  third party belongs in `services/`
- Validation is `express-validator` chains in `validator/`, never inline in a
  controller

**Frontend** — feature-first:

```
features/<name>/{services,state,hooks,pages,components}/
```

- `services/` holds axios calls and nothing else
- `state/` is a Redux Toolkit slice of plain reducers — no thunks
- `hooks/` is the seam pages use: it calls the service, dispatches to the slice,
  and normalises errors. Pages don't import services directly.
- Styling is inline `style` objects using the CSS variables from `index.css`
  (`--bg-color`, `--accent-color`, `--surface-color`, …). Never hardcode a hex
  that a variable already covers, or dark mode breaks.
- Fonts: Montserrat for headings, Inter for body, Playfair Display for accents

**Comments** explain *why*, not *what*. If a line needs a comment to say what it
does, rename something instead.

---

## Things that need extra care

**Money.** Amounts are computed server-side, in
`backend/src/config/commerce.js`, and travel to the client as `cart.amounts`.
Never recompute a total in the browser and never accept an amount from a
request body — that's a discount vulnerability.

**Payments.** `finalizePaidOrder` must stay idempotent; the browser callback and
the webhook both call it for the same order. If you add a side effect there,
make sure running it twice is harmless.

**Auth.** The session JWT is httpOnly by design. If you find yourself wanting to
read it in JavaScript, the answer is a `/api/auth/me` call instead.

**Ownership.** Every query for a user-owned document filters on `user`. A lookup
by id alone is a data leak.

---

## Commits and PRs

Conventional-commit prefixes, matching the existing history:

```
feat: add coupon codes to checkout
fix: prevent oversell when two buyers race for the last unit
refactor: extract cart pipeline into a dao
docs: document the webhook setup
test: cover address ownership isolation
```

In the PR description, say what changed and why, and how you verified it. Screenshots
help for UI work.

---

## Reporting bugs

Open an issue with: what you did, what you expected, what happened, and your
Node and MongoDB versions. For payment issues, include the Razorpay order id
(`order_…`) — **never** a key, secret or signature.

## Security issues

Please don't open a public issue for a vulnerability. Email the maintainer
directly and allow time for a fix before disclosing.

---

By contributing, you agree your work is licensed under the [MIT License](LICENSE).
