import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import userModel from "../models/user.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Wishlist from "../models/wishlist.model.js";
import { calculateOrderAmounts } from "../config/commerce.js";

/**
 * Bulk demo data — many sellers, many buyers, a deep catalogue, and optionally
 * a back-catalogue of paid orders so the seller dashboard has a curve to draw.
 *
 *   npm run seed:bulk
 *   npm run seed:bulk -- --sellers=25 --buyers=200 --products=600 --orders=800
 *   npm run seed:bulk -- --fresh          # rebuild from scratch
 *
 * Every account it creates lives on @ecomfy.test, which is also how --fresh
 * finds its own data again. Nothing outside that domain is ever touched, so
 * running this against a database with real signups is safe.
 */

const SEED_DOMAIN = "ecomfy.test";
const DEFAULT_PASSWORD = "qwertyui";
const CURRENCY = "INR";
const BATCH = 500;

// ── CLI ──────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value ?? true];
  }),
);

const options = {
  sellers: Number(args.sellers ?? 12),
  buyers: Number(args.buyers ?? 120),
  products: Number(args.products ?? 300),
  orders: Number(args.orders ?? 400),
  // How far back the order history stretches — the dashboard's longest window
  // is 90 days, so the default covers it with room to spare.
  days: Number(args.days ?? 120),
  password: String(args.password ?? DEFAULT_PASSWORD),
  fresh: Boolean(args.fresh),
};

// ── Deterministic randomness ─────────────────────────────────────
// Seeded so two runs produce the same store: a demo you can talk over without
// the numbers moving under you. Pass --seed=<n> for a different draw.
let rngState = Number(args.seed ?? 20260807) >>> 0;
const random = () => {
  rngState = (rngState + 0x6d2b79f5) >>> 0;
  let t = rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const randomInt = (min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (list) => list[Math.floor(random() * list.length)];
const pickSome = (list, count) =>
  [...list].sort(() => random() - 0.5).slice(0, count);

// ── Catalogue vocabulary ─────────────────────────────────────────
const BRANDS = [
  "Ecomfy", "Nord Supply", "Kraft & Co", "Atelier 9", "Sable Street",
  "Ironwood", "Meridian", "Havelock", "Fifth Avenue Co", "Loom & Last",
  "Basalt", "Tanner Bros", "Wildgrain", "Nightshift", "Odeon",
  "Rustwood", "Cobalt Lane", "Marlowe", "Pinegrove", "Stonecut",
];

const CITIES = [
  ["Mumbai", "Maharashtra", "400050"], ["Bengaluru", "Karnataka", "560034"],
  ["Delhi", "Delhi", "110016"], ["Pune", "Maharashtra", "411004"],
  ["Hyderabad", "Telangana", "500034"], ["Chennai", "Tamil Nadu", "600020"],
  ["Kolkata", "West Bengal", "700019"], ["Jaipur", "Rajasthan", "302001"],
  ["Ahmedabad", "Gujarat", "380009"], ["Kochi", "Kerala", "682016"],
  ["Indore", "Madhya Pradesh", "452001"], ["Lucknow", "Uttar Pradesh", "226001"],
];

const FIRST_NAMES = [
  "Aarav", "Diya", "Kabir", "Meera", "Rohan", "Ananya", "Vivaan", "Isha",
  "Arjun", "Tara", "Neel", "Sara", "Dev", "Riya", "Yash", "Nisha",
  "Kian", "Zoya", "Ved", "Anika", "Rehan", "Myra", "Aryan", "Kiara",
];

const LAST_NAMES = [
  "Sharma", "Nair", "Iyer", "Kapoor", "Bose", "Reddy", "Menon", "Chopra",
  "Rao", "Joshi", "Sethi", "Verma", "Ghosh", "Malhotra", "Pillai", "Bhat",
];

const ADJECTIVES = [
  "Oversized", "Relaxed", "Tailored", "Vintage", "Essential", "Structured",
  "Washed", "Heavyweight", "Minimalist", "Utility", "Cropped", "Classic",
];

const FITS = ["Regular", "Slim", "Relaxed", "Oversized", "Boxy"];
const CARE = ["Machine wash cold", "Hand wash only", "Dry clean recommended"];

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const WAIST_SIZES = ["28", "30", "32", "34", "36", "38"];
const SHOE_SIZES = ["6", "7", "8", "9", "10", "11"];

const COLORS = [
  "Black", "Off White", "Obsidian", "Sand", "Olive", "Navy", "Rust",
  "Charcoal", "Ecru", "Forest", "Bone", "Slate",
];

// Real image URLs, so the grid isn't a wall of placeholders.
const IMAGES = {
  tee: [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop",
  ],
  shirt: [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588359348347-9bc6cbaa689f?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop",
  ],
  bottoms: [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop",
  ],
  outerwear: [
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop",
  ],
  knitwear: [
    "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop",
  ],
  shoes: [
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop",
  ],
};

// Materials are per category, not global — drawing them from one pool produces
// linen sneakers and knit jeans.
const CATEGORIES = [
  { type: "Tee", materials: ["Cotton", "Jersey"], sizes: APPAREL_SIZES, price: [699, 1499], images: IMAGES.tee },
  { type: "Hoodie", materials: ["Fleece", "Cotton"], sizes: APPAREL_SIZES, price: [1799, 3299], images: IMAGES.tee },
  { type: "Shirt", materials: ["Linen", "Cotton", "Twill"], sizes: APPAREL_SIZES, price: [1299, 2499], images: IMAGES.shirt },
  { type: "Polo", materials: ["Knit", "Cotton"], sizes: APPAREL_SIZES, price: [1099, 1999], images: IMAGES.shirt },
  { type: "Jeans", materials: ["Denim"], sizes: WAIST_SIZES, price: [1999, 3999], images: IMAGES.bottoms },
  { type: "Cargo Joggers", materials: ["Twill", "Cotton"], sizes: WAIST_SIZES, price: [1499, 2799], images: IMAGES.bottoms },
  { type: "Chino Shorts", materials: ["Twill", "Cotton"], sizes: WAIST_SIZES, price: [999, 1799], images: IMAGES.bottoms },
  { type: "Bomber Jacket", materials: ["Twill", "Nylon"], sizes: APPAREL_SIZES, price: [2999, 5999], images: IMAGES.outerwear },
  { type: "Denim Jacket", materials: ["Denim"], sizes: APPAREL_SIZES, price: [2499, 4999], images: IMAGES.outerwear },
  { type: "Blazer", materials: ["Linen", "Twill", "Corduroy"], sizes: APPAREL_SIZES, price: [3999, 7999], images: IMAGES.outerwear },
  { type: "Cardigan", materials: ["Knit", "Wool"], sizes: APPAREL_SIZES, price: [1999, 3499], images: IMAGES.knitwear },
  { type: "Quarter-Zip", materials: ["Fleece", "Knit"], sizes: APPAREL_SIZES, price: [1699, 2999], images: IMAGES.knitwear },
  { type: "Sneakers", materials: ["Leather", "Canvas"], sizes: SHOE_SIZES, price: [2499, 5499], images: IMAGES.shoes },
  { type: "Chelsea Boots", materials: ["Suede", "Leather"], sizes: SHOE_SIZES, price: [3499, 6999], images: IMAGES.shoes },
  { type: "Loafers", materials: ["Leather", "Suede"], sizes: SHOE_SIZES, price: [2799, 5999], images: IMAGES.shoes },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const round99 = (n) => Math.round(n / 100) * 100 - 1;

const insertInBatches = async (Model, docs, options = {}) => {
  for (let i = 0; i < docs.length; i += BATCH) {
    await Model.insertMany(docs.slice(i, i + BATCH), options);
  }
};

// ── Builders ─────────────────────────────────────────────────────
const buildUsers = (passwordHash) => {
  const users = [];

  for (let i = 0; i < options.sellers; i++) {
    users.push({
      fullname: `${BRANDS[i % BRANDS.length]}${i >= BRANDS.length ? ` ${Math.floor(i / BRANDS.length) + 1}` : ""}`,
      email: `seller${i + 1}@${SEED_DOMAIN}`,
      password: passwordHash,
      // Sequential so they're unique — the register endpoint rejects duplicates.
      contact: String(9000000000 + i),
      role: "seller",
    });
  }

  for (let i = 0; i < options.buyers; i++) {
    users.push({
      fullname: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      email: `buyer${i + 1}@${SEED_DOMAIN}`,
      password: passwordHash,
      contact: String(9500000000 + i),
      role: "buyer",
    });
  }

  return users;
};

const buildAddress = (buyer, index) => {
  const [city, state, pincode] = CITIES[index % CITIES.length];
  return {
    user: buyer._id,
    fullname: buyer.fullname,
    phone: buyer.contact,
    line1: `${randomInt(1, 300)} ${pick(["Hill Road", "Church Street", "MG Road", "Linking Road", "Park Lane"])}`,
    line2: `Flat ${randomInt(1, 40)}${pick(["A", "B", "C"])}`,
    city,
    state,
    pincode,
    country: "India",
    label: pick(["home", "work", "other"]),
    isDefault: true,
  };
};

const buildProduct = (sellerId) => {
  const category = pick(CATEGORIES);
  const material = pick(category.materials);
  // "Denim Denim Jacket" — skip the material when the type already says it.
  const title = category.type.includes(material)
    ? `${pick(ADJECTIVES)} ${category.type}`
    : `${pick(ADJECTIVES)} ${material} ${category.type}`;
  const basePrice = round99(randomInt(category.price[0], category.price[1]));
  const images = pickSome(category.images, randomInt(1, Math.min(3, category.images.length)));

  const colors = pickSome(COLORS, randomInt(1, 3));
  const sizes = pickSome(category.sizes, randomInt(2, 4)).sort(
    (a, b) => category.sizes.indexOf(a) - category.sizes.indexOf(b),
  );

  const variant = [];
  for (const color of colors) {
    for (const size of sizes) {
      // A realistic spread: some dead stock, some about to run out, most healthy.
      const roll = random();
      const stock = roll < 0.08 ? 0 : roll < 0.22 ? randomInt(1, 5) : randomInt(6, 60);

      variant.push({
        images: [{ url: pick(category.images) }],
        price: {
          // Bigger sizes cost a little more, as they do in a real catalogue.
          amount: basePrice + (["XL", "XXL", "38"].includes(size) ? 200 : 0),
          currency: CURRENCY,
        },
        attributes: { size, color },
        stock,
      });
    }
  }

  return {
    title,
    description: `${title} cut from ${material.toLowerCase()} with a ${pick(FITS).toLowerCase()} fit. Built for everyday wear and finished with hardware that survives the wash.`,
    attributes: { Material: material, Fit: pick(FITS), Care: pick(CARE) },
    seller: sellerId,
    price: { amount: basePrice, currency: CURRENCY },
    images: images.map((url) => ({ url })),
    variant,
  };
};

/**
 * One paid order, drawn from products that still have stock. Mirrors what
 * payment.controller.js writes at checkout — frozen item and address snapshots,
 * amounts from the shared commerce rules — so the seller screens read the same
 * shape they would in production.
 */
const buildOrder = (buyer, address, sellableProducts, index) => {
  const chosen = pickSome(sellableProducts, randomInt(1, 3));
  const items = [];

  for (const product of chosen) {
    const inStock = product.variant.filter((v) => v.stock > 0);
    if (!inStock.length) continue;

    const variant = pick(inStock);
    const quantity = Math.min(randomInt(1, 2), variant.stock);
    // Taken off the shelf here so the same unit can't be sold twice across the
    // generated history, and so the stock left behind is consistent with it.
    variant.stock -= quantity;

    items.push({
      product: product._id,
      variant: variant._id,
      title: product.title,
      image: variant.images?.[0]?.url || product.images?.[0]?.url,
      attributes: variant.attributes,
      quantity,
      price: variant.price,
    });
  }

  if (!items.length) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price.amount * item.quantity,
    0,
  );
  const amounts = calculateOrderAmounts(subtotal);
  const money = (amount) => ({ amount, currency: CURRENCY });

  const placedAt = new Date(
    Date.now() - random() * options.days * DAY_MS - randomInt(0, 23) * 3600000,
  );
  // Older orders have had time to arrive; this week's are still in transit.
  const ageDays = (Date.now() - placedAt.getTime()) / DAY_MS;
  const status = ageDays > 10 ? "delivered" : ageDays > 3 ? "shipped" : "confirmed";

  return {
    user: buyer._id,
    items,
    shippingAddress: {
      address: address._id,
      fullname: address.fullname,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    },
    subtotal: money(amounts.subtotal),
    shipping: money(amounts.shipping),
    tax: money(amounts.tax),
    total: money(amounts.total),
    status,
    payment: {
      provider: "razorpay",
      status: "paid",
      razorpayOrderId: `order_seed_${index}`,
      razorpayPaymentId: `pay_seed_${index}`,
      method: pick(["upi", "card", "netbanking", "wallet"]),
      paidAt: new Date(placedAt.getTime() + randomInt(30, 600) * 1000),
    },
    createdAt: placedAt,
    updatedAt: placedAt,
  };
};

// ── Run ──────────────────────────────────────────────────────────
const seed = async () => {
  const startedAt = Date.now();
  await connectDB();

  const domainFilter = { email: { $regex: `@${SEED_DOMAIN}$` } };
  const existing = await userModel.find(domainFilter).select("_id");

  if (options.fresh && existing.length) {
    const ids = existing.map((user) => user._id);
    console.log(`Clearing ${ids.length} previously seeded accounts and their data…`);
    await Promise.all([
      Product.deleteMany({ seller: { $in: ids } }),
      Order.deleteMany({ user: { $in: ids } }),
      Address.deleteMany({ user: { $in: ids } }),
      Cart.deleteMany({ user: { $in: ids } }),
      Wishlist.deleteMany({ user: { $in: ids } }),
      userModel.deleteMany({ _id: { $in: ids } }),
    ]);
  } else if (existing.length) {
    console.error(
      `Found ${existing.length} accounts already seeded on @${SEED_DOMAIN}.\n` +
        "Re-run with --fresh to rebuild them, or --password/--seed to a different set.",
    );
    await mongoose.connection.close();
    process.exit(1);
  }

  // The password is hashed once and shared. Every seeded account uses the same
  // one anyway, so per-user salting would buy nothing but minutes of bcrypt.
  console.log("Hashing the shared demo password…");
  const passwordHash = await bcrypt.hash(options.password, 10);

  console.log(`Creating ${options.sellers} sellers and ${options.buyers} buyers…`);
  await insertInBatches(userModel, buildUsers(passwordHash));

  const sellers = await userModel.find({ ...domainFilter, role: "seller" });
  const buyers = await userModel.find({ ...domainFilter, role: "buyer" });

  console.log(`Creating ${options.products} products across ${sellers.length} sellers…`);
  const products = Array.from({ length: options.products }, (_, i) =>
    buildProduct(sellers[i % sellers.length]._id),
  );
  await insertInBatches(Product, products);

  console.log(`Creating one address per buyer…`);
  await insertInBatches(
    Address,
    buyers.map((buyer, i) => buildAddress(buyer, i)),
  );

  let orderCount = 0;
  if (options.orders > 0) {
    console.log(`Creating ${options.orders} paid orders over the last ${options.days} days…`);

    // Read back with _ids so orders can point at real variant subdocuments.
    const saved = await Product.find({ seller: { $in: sellers.map((s) => s._id) } });
    const addresses = await Address.find({ user: { $in: buyers.map((b) => b._id) } });
    const addressByUser = new Map(
      addresses.map((address) => [address.user.toString(), address]),
    );

    const orders = [];
    for (let i = 0; i < options.orders; i++) {
      const buyer = pick(buyers);
      const order = buildOrder(
        buyer,
        addressByUser.get(buyer._id.toString()),
        saved,
        i,
      );
      if (order) orders.push(order);
    }

    // timestamps:false — the point of these documents is that they are old, and
    // Mongoose would otherwise stamp every one of them with "now".
    await insertInBatches(Order, orders, { timestamps: false });
    orderCount = orders.length;

    console.log("Writing back the stock those orders consumed…");
    await Product.bulkWrite(
      saved.map((product) => ({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: Object.fromEntries(
              product.variant.map((v, i) => [`variant.${i}.stock`, v.stock]),
            ),
          },
        },
      })),
    );
  }

  const variants = products.reduce((sum, p) => sum + p.variant.length, 0);
  const revenue = orderCount
    ? (await Order.aggregate([
        { $match: { "payment.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$total.amount" } } },
      ]))[0]?.total || 0
    : 0;

  console.log(`
Seeding complete in ${((Date.now() - startedAt) / 1000).toFixed(1)}s

  Sellers    ${sellers.length}
  Buyers     ${buyers.length}
  Products   ${products.length}  (${variants} variants)
  Orders     ${orderCount}${orderCount ? `  (₹${revenue.toLocaleString("en-IN")} gross)` : ""}

Sign in with any of these — the password is the same for every account:

  Seller     seller1@${SEED_DOMAIN}  …  seller${sellers.length}@${SEED_DOMAIN}
  Buyer      buyer1@${SEED_DOMAIN}   …  buyer${buyers.length}@${SEED_DOMAIN}
  Password   ${options.password}
`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error("Seeding failed:", error);
  await mongoose.connection.close();
  process.exit(1);
});
