import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import Product from "../models/product.model.js";
import connectDB from "../config/db.js";

const demoSeller = {
  fullname: "Studio Seller",
  email: "studio@ecomfy.in",
  password: "password123",
  contact: "9876543211",
  role: "seller",
};

// Unique Unsplash images to avoid duplicates and ensure high quality
const imagesDatabase = {
  hoodieBlack: [
    { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1556821840-410a0e9cb2b0?w=600&auto=format&fit=crop" }
  ],
  hoodieSand: [
    { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1609873814058-a8928924184a?w=600&auto=format&fit=crop" }
  ],
  jeansBlue: [
    { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop" }
  ],
  jeansCharcoal: [
    { url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop" }
  ],
  waffleOlive: [
    { url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop" }
  ],
  waffleOatmeal: [
    { url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&auto=format&fit=crop" }
  ],
  cargoGrey: [
    { url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600&auto=format&fit=crop" }
  ],
  cargoBlack: [
    { url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop" }
  ],
  jacketIndigo: [
    { url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop" }
  ],
  jacketBleach: [
    { url: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&auto=format&fit=crop" }
  ],
  sweaterCocoa: [
    { url: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop" }
  ],
  sweaterCream: [
    { url: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop" }
  ],
  flannelRed: [
    { url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=600&auto=format&fit=crop" }
  ],
  flannelForest: [
    { url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop" }
  ],
  vestBlack: [
    { url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop" }
  ],
  vestOlive: [
    { url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=600&auto=format&fit=crop" }
  ],
  pufferNoir: [
    { url: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop" }
  ],
  pufferSilver: [
    { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop" }
  ],
  poloSage: [
    { url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1626497746447-0e5774d0a600?w=600&auto=format&fit=crop" }
  ],
  poloNavy: [
    { url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop" }
  ],
  teeWhite: [
    { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop" }
  ],
  teeIndigo: [
    { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1503342452485-86b7f54527ef?w=600&auto=format&fit=crop" }
  ],
  leatherEspresso: [
    { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop" }
  ],
  leatherObsidian: [
    { url: "https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&auto=format&fit=crop" }
  ],
  corduroyRust: [
    { url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop" }
  ],
  corduroySage: [
    { url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1626497746447-0e5774d0a600?w=600&auto=format&fit=crop" }
  ],
  doubleKneeBrown: [
    { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop" }
  ],
  doubleKneeBlack: [
    { url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop" }
  ],
  terryCoconut: [
    { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop" }
  ],
  terryBlue: [
    { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1626497746447-0e5774d0a600?w=600&auto=format&fit=crop" }
  ],
  bomberOlive: [
    { url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=600&auto=format&fit=crop" }
  ],
  bomberBlack: [
    { url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop" }
  ],
  waxedTan: [
    { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop" }
  ],
  waxedSpruce: [
    { url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop" }
  ],
  linenSand: [
    { url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop" }
  ],
  linenWhite: [
    { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop" }
  ],
  joggerGrey: [
    { url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600&auto=format&fit=crop" }
  ],
  joggerSlate: [
    { url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop" }
  ],
  shortsBlue: [
    { url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop" }
  ],
  shortsEmerald: [
    { url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=600&auto=format&fit=crop" }
  ]
};

const newProducts = [
  {
    title: "Ecomfy Premium Heavyweight Hoodie v2",
    description: "Luxurious, dense cotton fleece hoodie designed for the modern brutalist style. Zero drawcords and double-lined hood construct a seamless and clean silhouette.",
    price: { amount: 3899, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop" }],
    attributes: { Material: "480GSM Cotton Fleece", Fit: "Boxy Oversized", Origin: "Made in India" },
    variant: [
      { attributes: { size: "S", color: "Acid Wash Black" }, price: { amount: 3899, currency: "INR" }, stock: 15, images: imagesDatabase.hoodieBlack },
      { attributes: { size: "M", color: "Acid Wash Black" }, price: { amount: 3899, currency: "INR" }, stock: 25, images: imagesDatabase.hoodieBlack },
      { attributes: { size: "L", color: "Acid Wash Black" }, price: { amount: 3999, currency: "INR" }, stock: 20, images: imagesDatabase.hoodieBlack },
      { attributes: { size: "S", color: "Desert Sand" }, price: { amount: 4099, currency: "INR" }, stock: 10, images: imagesDatabase.hoodieSand },
      { attributes: { size: "M", color: "Desert Sand" }, price: { amount: 4099, currency: "INR" }, stock: 18, images: imagesDatabase.hoodieSand },
      { attributes: { size: "L", color: "Desert Sand" }, price: { amount: 4199, currency: "INR" }, stock: 12, images: imagesDatabase.hoodieSand }
    ]
  },
  {
    title: "Ecomfy Heavy Carpenter Denim v2",
    description: "Tough utility carpenter pants cut from premium heavy raw denim, featuring double panel utility pockets, custom hardware and a robust hammer loop.",
    price: { amount: 3199, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop" }],
    attributes: { Material: "13.5oz Rigid Denim", Fit: "Relaxed Straight Leg", Origin: "Made in India" },
    variant: [
      { attributes: { size: "30", color: "Vintage Blue" }, price: { amount: 3199, currency: "INR" }, stock: 10, images: imagesDatabase.jeansBlue },
      { attributes: { size: "32", color: "Vintage Blue" }, price: { amount: 3199, currency: "INR" }, stock: 20, images: imagesDatabase.jeansBlue },
      { attributes: { size: "34", color: "Vintage Blue" }, price: { amount: 3299, currency: "INR" }, stock: 15, images: imagesDatabase.jeansBlue },
      { attributes: { size: "30", color: "Charcoal" }, price: { amount: 3399, currency: "INR" }, stock: 12, images: imagesDatabase.jeansCharcoal },
      { attributes: { size: "32", color: "Charcoal" }, price: { amount: 3399, currency: "INR" }, stock: 25, images: imagesDatabase.jeansCharcoal },
      { attributes: { size: "34", color: "Charcoal" }, price: { amount: 3499, currency: "INR" }, stock: 18, images: imagesDatabase.jeansCharcoal }
    ]
  },
  {
    title: "Ecomfy Textured Thermal Waffle Knit",
    description: "Thick thermal longsleeve crewneck with structured ribbing at cuffs and waist. Provides ultimate thermal insulation while maintaining breathability.",
    price: { amount: 1899, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop" }],
    attributes: { Material: "100% Thermal Cotton Waffle", Fit: "Regular Boxy", Weight: "320GSM" },
    variant: [
      { attributes: { size: "S", color: "Olive" }, price: { amount: 1899, currency: "INR" }, stock: 15, images: imagesDatabase.waffleOlive },
      { attributes: { size: "M", color: "Olive" }, price: { amount: 1899, currency: "INR" }, stock: 22, images: imagesDatabase.waffleOlive },
      { attributes: { size: "L", color: "Olive" }, price: { amount: 1999, currency: "INR" }, stock: 12, images: imagesDatabase.waffleOlive },
      { attributes: { size: "S", color: "Oatmeal" }, price: { amount: 1999, currency: "INR" }, stock: 14, images: imagesDatabase.waffleOatmeal },
      { attributes: { size: "M", color: "Oatmeal" }, price: { amount: 1999, currency: "INR" }, stock: 25, images: imagesDatabase.waffleOatmeal },
      { attributes: { size: "L", color: "Oatmeal" }, price: { amount: 2099, currency: "INR" }, stock: 18, images: imagesDatabase.waffleOatmeal }
    ]
  },
  {
    title: "Ecomfy Tech Nylon Cargo Pants",
    description: "Constructed from lightweight, water-resistant matte micro-ripstop nylon. Multi-pocket design with adjustable toggle hems at the cuffs.",
    price: { amount: 2899, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Matte Taslan Nylon", Fit: "Relaxed Tech", WaterResistance: "DWR Coated" },
    variant: [
      { attributes: { size: "S", color: "Steel Grey" }, price: { amount: 2899, currency: "INR" }, stock: 20, images: imagesDatabase.cargoGrey },
      { attributes: { size: "M", color: "Steel Grey" }, price: { amount: 2899, currency: "INR" }, stock: 30, images: imagesDatabase.cargoGrey },
      { attributes: { size: "L", color: "Steel Grey" }, price: { amount: 2999, currency: "INR" }, stock: 15, images: imagesDatabase.cargoGrey },
      { attributes: { size: "S", color: "Noir" }, price: { amount: 2999, currency: "INR" }, stock: 25, images: imagesDatabase.cargoBlack },
      { attributes: { size: "M", color: "Noir" }, price: { amount: 2999, currency: "INR" }, stock: 35, images: imagesDatabase.cargoBlack },
      { attributes: { size: "L", color: "Noir" }, price: { amount: 3099, currency: "INR" }, stock: 20, images: imagesDatabase.cargoBlack }
    ]
  },
  {
    title: "Ecomfy Retro Boxy Denim Jacket",
    description: "An archive-inspired cropped boxy denim jacket. Crafted from raw 14oz Japanese denim with pleats and heavy silver button fasteners.",
    price: { amount: 4499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop" }],
    attributes: { Material: "14oz Selvedge Denim", Fit: "Cropped Boxy", Origin: "Made in India" },
    variant: [
      { attributes: { size: "M", color: "Indigo" }, price: { amount: 4499, currency: "INR" }, stock: 10, images: imagesDatabase.jacketIndigo },
      { attributes: { size: "L", color: "Indigo" }, price: { amount: 4499, currency: "INR" }, stock: 14, images: imagesDatabase.jacketIndigo },
      { attributes: { size: "XL", color: "Indigo" }, price: { amount: 4599, currency: "INR" }, stock: 8, images: imagesDatabase.jacketIndigo },
      { attributes: { size: "M", color: "Bleach Wash" }, price: { amount: 4699, currency: "INR" }, stock: 8, images: imagesDatabase.jacketBleach },
      { attributes: { size: "L", color: "Bleach Wash" }, price: { amount: 4699, currency: "INR" }, stock: 12, images: imagesDatabase.jacketBleach },
      { attributes: { size: "XL", color: "Bleach Wash" }, price: { amount: 4799, currency: "INR" }, stock: 5, images: imagesDatabase.jacketBleach }
    ]
  },
  {
    title: "Ecomfy Cozy Mockneck Sweater",
    description: "Minimalist mockneck sweater spun from ultra-soft cotton wool blend yarns. Tight ribs at collar, cuffs, and hem ensure a structured drape.",
    price: { amount: 2699, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Cotton Wool Acrylic Blend", Fit: "Semi-Oversized", Warmth: "Medium" },
    variant: [
      { attributes: { size: "M", color: "Cocoa" }, price: { amount: 2699, currency: "INR" }, stock: 12, images: imagesDatabase.sweaterCocoa },
      { attributes: { size: "L", color: "Cocoa" }, price: { amount: 2699, currency: "INR" }, stock: 18, images: imagesDatabase.sweaterCocoa },
      { attributes: { size: "XL", color: "Cocoa" }, price: { amount: 2799, currency: "INR" }, stock: 10, images: imagesDatabase.sweaterCocoa },
      { attributes: { size: "M", color: "Cream" }, price: { amount: 2899, currency: "INR" }, stock: 15, images: imagesDatabase.sweaterCream },
      { attributes: { size: "L", color: "Cream" }, price: { amount: 2899, currency: "INR" }, stock: 22, images: imagesDatabase.sweaterCream },
      { attributes: { size: "XL", color: "Cream" }, price: { amount: 2999, currency: "INR" }, stock: 8, images: imagesDatabase.sweaterCream }
    ]
  },
  {
    title: "Ecomfy Heavy Flannel Shacket",
    description: "A thick flannel jacket-shirt hybrid. Crafted with double-brushed premium flannel cotton for ultimate warmth and comfort. Flap chest pockets.",
    price: { amount: 2399, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Double-Brushed Premium Flannel", Fit: "Relaxed Overcoat", Weight: "340GSM" },
    variant: [
      { attributes: { size: "M", color: "Red Plaid" }, price: { amount: 2399, currency: "INR" }, stock: 18, images: imagesDatabase.flannelRed },
      { attributes: { size: "L", color: "Red Plaid" }, price: { amount: 2399, currency: "INR" }, stock: 25, images: imagesDatabase.flannelRed },
      { attributes: { size: "XL", color: "Red Plaid" }, price: { amount: 2499, currency: "INR" }, stock: 12, images: imagesDatabase.flannelRed },
      { attributes: { size: "M", color: "Forest Plaid" }, price: { amount: 2599, currency: "INR" }, stock: 14, images: imagesDatabase.flannelForest },
      { attributes: { size: "L", color: "Forest Plaid" }, price: { amount: 2599, currency: "INR" }, stock: 20, images: imagesDatabase.flannelForest },
      { attributes: { size: "XL", color: "Forest Plaid" }, price: { amount: 2699, currency: "INR" }, stock: 8, images: imagesDatabase.flannelForest }
    ]
  },
  {
    title: "Ecomfy tactical Utility Vest v2",
    description: "Elevate your streetwear styling with this tactical utility vest. Equipped with heavy-duty quick release buckles and multi-zip cargo storage pockets.",
    price: { amount: 2199, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Reinforced Codura Ripstop", Fit: "Adjustable Straps", Closure: "Tactical Buckles" },
    variant: [
      { attributes: { size: "One Size", color: "Tactical Black" }, price: { amount: 2199, currency: "INR" }, stock: 40, images: imagesDatabase.vestBlack },
      { attributes: { size: "One Size", color: "Olive Green" }, price: { amount: 2299, currency: "INR" }, stock: 30, images: imagesDatabase.vestOlive }
    ]
  },
  {
    title: "Ecomfy Winter Down Puffer v2",
    description: "Insulated down puffer jacket designed to withstand cold winters. Features an ultra-puffy design, a detachable hood, and storm cuffs.",
    price: { amount: 5499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Waterproof Ripstop Shell", Insulation: "90/10 White Duck Down", Warmth: "Sub-Zero Rated" },
    variant: [
      { attributes: { size: "M", color: "Matte Noir" }, price: { amount: 5499, currency: "INR" }, stock: 15, images: imagesDatabase.pufferNoir },
      { attributes: { size: "L", color: "Matte Noir" }, price: { amount: 5499, currency: "INR" }, stock: 20, images: imagesDatabase.pufferNoir },
      { attributes: { size: "XL", color: "Matte Noir" }, price: { amount: 5599, currency: "INR" }, stock: 10, images: imagesDatabase.pufferNoir },
      { attributes: { size: "M", color: "Gloss Silver" }, price: { amount: 5699, currency: "INR" }, stock: 8, images: imagesDatabase.pufferSilver },
      { attributes: { size: "L", color: "Gloss Silver" }, price: { amount: 5699, currency: "INR" }, stock: 12, images: imagesDatabase.pufferSilver },
      { attributes: { size: "XL", color: "Gloss Silver" }, price: { amount: 5799, currency: "INR" }, stock: 5, images: imagesDatabase.pufferSilver }
    ]
  },
  {
    title: "Ecomfy Camp-Collar Knit Polo",
    description: "Vintage camp-collar polo knit from high-gauge soft cotton yarns. Structured knit patterns add unique textural visual details.",
    price: { amount: 2199, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop" }],
    attributes: { Material: "100% High-Gauge Cotton Yarns", Fit: "Boxy Retro", Collar: "Camp Collar" },
    variant: [
      { attributes: { size: "S", color: "Sage" }, price: { amount: 2199, currency: "INR" }, stock: 12, images: imagesDatabase.poloSage },
      { attributes: { size: "M", color: "Sage" }, price: { amount: 2199, currency: "INR" }, stock: 18, images: imagesDatabase.poloSage },
      { attributes: { size: "L", color: "Sage" }, price: { amount: 2299, currency: "INR" }, stock: 10, images: imagesDatabase.poloSage },
      { attributes: { size: "S", color: "Navy" }, price: { amount: 2299, currency: "INR" }, stock: 15, images: imagesDatabase.poloNavy },
      { attributes: { size: "M", color: "Navy" }, price: { amount: 2299, currency: "INR" }, stock: 22, images: imagesDatabase.poloNavy },
      { attributes: { size: "L", color: "Navy" }, price: { amount: 2399, currency: "INR" }, stock: 14, images: imagesDatabase.poloNavy }
    ]
  },
  {
    title: "Ecomfy Heavy Graphic Tee v2",
    description: "Boxy oversized graphic tee with customized typography print. Soft pre-shrunk washed cotton feels premium and holds shape.",
    price: { amount: 1599, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop" }],
    attributes: { Material: "260GSM Heavy Cotton", Fit: "Oversized Streetwear", PrintType: "High-Density Screen Print" },
    variant: [
      { attributes: { size: "S", color: "Off-White" }, price: { amount: 1599, currency: "INR" }, stock: 30, images: imagesDatabase.teeWhite },
      { attributes: { size: "M", color: "Off-White" }, price: { amount: 1599, currency: "INR" }, stock: 45, images: imagesDatabase.teeWhite },
      { attributes: { size: "L", color: "Off-White" }, price: { amount: 1699, currency: "INR" }, stock: 35, images: imagesDatabase.teeWhite },
      { attributes: { size: "XL", color: "Off-White" }, price: { amount: 1699, currency: "INR" }, stock: 20, images: imagesDatabase.teeWhite },
      { attributes: { size: "S", color: "Faded Indigo" }, price: { amount: 1699, currency: "INR" }, stock: 25, images: imagesDatabase.teeIndigo },
      { attributes: { size: "M", color: "Faded Indigo" }, price: { amount: 1699, currency: "INR" }, stock: 40, images: imagesDatabase.teeIndigo },
      { attributes: { size: "L", color: "Faded Indigo" }, price: { amount: 1799, currency: "INR" }, stock: 30, images: imagesDatabase.teeIndigo },
      { attributes: { size: "XL", color: "Faded Indigo" }, price: { amount: 1799, currency: "INR" }, stock: 15, images: imagesDatabase.teeIndigo }
    ]
  },
  {
    title: "Ecomfy Aviator Flight Jacket v2",
    description: "Classic aviator silhouette featuring rich vegan leather, warm quilted satin lining and a cozy detachable faux-shearling collar.",
    price: { amount: 5999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Premium Vegan PU Leather", Fit: "Regular Flight Jacket", Collar: "Detachable Shearling" },
    variant: [
      { attributes: { size: "M", color: "Espresso" }, price: { amount: 5999, currency: "INR" }, stock: 8, images: imagesDatabase.leatherEspresso },
      { attributes: { size: "L", color: "Espresso" }, price: { amount: 5999, currency: "INR" }, stock: 12, images: imagesDatabase.leatherEspresso },
      { attributes: { size: "XL", color: "Espresso" }, price: { amount: 6199, currency: "INR" }, stock: 6, images: imagesDatabase.leatherEspresso },
      { attributes: { size: "M", color: "Obsidian" }, price: { amount: 6299, currency: "INR" }, stock: 10, images: imagesDatabase.leatherObsidian },
      { attributes: { size: "L", color: "Obsidian" }, price: { amount: 6299, currency: "INR" }, stock: 15, images: imagesDatabase.leatherObsidian },
      { attributes: { size: "XL", color: "Obsidian" }, price: { amount: 6499, currency: "INR" }, stock: 8, images: imagesDatabase.leatherObsidian }
    ]
  },
  {
    title: "Ecomfy Corduroy Overshirt Jacket",
    description: "Plush 8-wales corduroy overshirt. Finished with branded buttons, dual chest pockets, and a clean curved shirt-tail hem.",
    price: { amount: 2299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop" }],
    attributes: { Material: "8-Wales Premium Corduroy", Fit: "Relaxed Fit", Origin: "Made in India" },
    variant: [
      { attributes: { size: "M", color: "Rust" }, price: { amount: 2299, currency: "INR" }, stock: 15, images: imagesDatabase.corduroyRust },
      { attributes: { size: "L", color: "Rust" }, price: { amount: 2299, currency: "INR" }, stock: 22, images: imagesDatabase.corduroyRust },
      { attributes: { size: "XL", color: "Rust" }, price: { amount: 2399, currency: "INR" }, stock: 10, images: imagesDatabase.corduroyRust },
      { attributes: { size: "M", color: "Sage Green" }, price: { amount: 2499, currency: "INR" }, stock: 18, images: imagesDatabase.corduroySage },
      { attributes: { size: "L", color: "Sage Green" }, price: { amount: 2499, currency: "INR" }, stock: 25, images: imagesDatabase.corduroySage },
      { attributes: { size: "XL", color: "Sage Green" }, price: { amount: 2599, currency: "INR" }, stock: 12, images: imagesDatabase.corduroySage }
    ]
  },
  {
    title: "Ecomfy Canvas Double-Knee Pants v2",
    description: "Highly durable workwear trousers made of heavy cotton duck canvas. Features reinforced panels on knees and custom hardware rivets.",
    price: { amount: 2999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop" }],
    attributes: { Material: "12oz Duck Canvas Cotton", Fit: "Relaxed Straight Fit", Stitching: "Triple-Needle Reinforced" },
    variant: [
      { attributes: { size: "30", color: "Brown Duck" }, price: { amount: 2999, currency: "INR" }, stock: 12, images: imagesDatabase.doubleKneeBrown },
      { attributes: { size: "32", color: "Brown Duck" }, price: { amount: 2999, currency: "INR" }, stock: 20, images: imagesDatabase.doubleKneeBrown },
      { attributes: { size: "34", color: "Brown Duck" }, price: { amount: 3099, currency: "INR" }, stock: 15, images: imagesDatabase.doubleKneeBrown },
      { attributes: { size: "30", color: "Off-Black" }, price: { amount: 3199, currency: "INR" }, stock: 18, images: imagesDatabase.doubleKneeBlack },
      { attributes: { size: "32", color: "Off-Black" }, price: { amount: 3199, currency: "INR" }, stock: 25, images: imagesDatabase.doubleKneeBlack },
      { attributes: { size: "34", color: "Off-Black" }, price: { amount: 3299, currency: "INR" }, stock: 12, images: imagesDatabase.doubleKneeBlack }
    ]
  },
  {
    title: "Ecomfy Terry Cotton Resort Shirt v2",
    description: "Cuban camp collar resort shirt cut from thick, absorbent terry cloth towelling cotton. Ideal for summer getaways and beachside comfort.",
    price: { amount: 1999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Premium Cotton Terry Towell", Fit: "Relaxed Camp Collar", Style: "Resortwear" },
    variant: [
      { attributes: { size: "S", color: "Coconut" }, price: { amount: 1999, currency: "INR" }, stock: 20, images: imagesDatabase.terryCoconut },
      { attributes: { size: "M", color: "Coconut" }, price: { amount: 1999, currency: "INR" }, stock: 30, images: imagesDatabase.terryCoconut },
      { attributes: { size: "L", color: "Coconut" }, price: { amount: 2099, currency: "INR" }, stock: 15, images: imagesDatabase.terryCoconut },
      { attributes: { size: "S", color: "Sky Blue" }, price: { amount: 2199, currency: "INR" }, stock: 15, images: imagesDatabase.terryBlue },
      { attributes: { size: "M", color: "Sky Blue" }, price: { amount: 2199, currency: "INR" }, stock: 25, images: imagesDatabase.terryBlue },
      { attributes: { size: "L", color: "Sky Blue" }, price: { amount: 2299, currency: "INR" }, stock: 12, images: imagesDatabase.terryBlue }
    ]
  },
  {
    title: "Ecomfy Quilted Bomber Jacket v2",
    description: "Modernized classic bomber jacket. Featuring standard diamond quilted exterior pattern, insulation lining, and rib-knit cuffs.",
    price: { amount: 3499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Diamond Quilted Satin Polyester", Fit: "Classic Bomber Fit", Lining: "Insulated Polyfill" },
    variant: [
      { attributes: { size: "M", color: "Olive Drab" }, price: { amount: 3499, currency: "INR" }, stock: 14, images: imagesDatabase.bomberOlive },
      { attributes: { size: "L", color: "Olive Drab" }, price: { amount: 3499, currency: "INR" }, stock: 18, images: imagesDatabase.bomberOlive },
      { attributes: { size: "XL", color: "Olive Drab" }, price: { amount: 3599, currency: "INR" }, stock: 8, images: imagesDatabase.bomberOlive },
      { attributes: { size: "M", color: "Black Pearl" }, price: { amount: 3699, currency: "INR" }, stock: 15, images: imagesDatabase.bomberBlack },
      { attributes: { size: "L", color: "Black Pearl" }, price: { amount: 3699, currency: "INR" }, stock: 22, images: imagesDatabase.bomberBlack },
      { attributes: { size: "XL", color: "Black Pearl" }, price: { amount: 3799, currency: "INR" }, stock: 10, images: imagesDatabase.bomberBlack }
    ]
  },
  {
    title: "Ecomfy Waxed Utility Field Coat v2",
    description: "Crafted from dry-waxed cotton canvas. Water and wind-repellent jacket featuring corduroy collar trim and four functional cargo pockets.",
    price: { amount: 4899, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Dry-Waxed Cotton Canvas", Fit: "Traditional Field Coat", WaterRepellency: "High" },
    variant: [
      { attributes: { size: "M", color: "Tan" }, price: { amount: 4899, currency: "INR" }, stock: 10, images: imagesDatabase.waxedTan },
      { attributes: { size: "L", color: "Tan" }, price: { amount: 4899, currency: "INR" }, stock: 15, images: imagesDatabase.waxedTan },
      { attributes: { size: "XL", color: "Tan" }, price: { amount: 4999, currency: "INR" }, stock: 6, images: imagesDatabase.waxedTan },
      { attributes: { size: "M", color: "Dark Spruce" }, price: { amount: 5199, currency: "INR" }, stock: 8, images: imagesDatabase.waxedSpruce },
      { attributes: { size: "L", color: "Dark Spruce" }, price: { amount: 5199, currency: "INR" }, stock: 12, images: imagesDatabase.waxedSpruce },
      { attributes: { size: "XL", color: "Dark Spruce" }, price: { amount: 5299, currency: "INR" }, stock: 5, images: imagesDatabase.waxedSpruce }
    ]
  },
  {
    title: "Ecomfy Pure Linen Drawstring Trousers",
    description: "Breathable pure linen trousers. Features an adjustable waistband drawcord and standard straight leg opening. Perfect for warm days.",
    price: { amount: 2499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop" }],
    attributes: { Material: "100% Belgian Linen", Fit: "Relaxed Drawstring Trousers", Origin: "Made in India" },
    variant: [
      { attributes: { size: "S", color: "Natural Sand" }, price: { amount: 2499, currency: "INR" }, stock: 15, images: imagesDatabase.linenSand },
      { attributes: { size: "M", color: "Natural Sand" }, price: { amount: 2499, currency: "INR" }, stock: 25, images: imagesDatabase.linenSand },
      { attributes: { size: "L", color: "Natural Sand" }, price: { amount: 2599, currency: "INR" }, stock: 18, images: imagesDatabase.linenSand },
      { attributes: { size: "S", color: "Off-White" }, price: { amount: 2599, currency: "INR" }, stock: 12, images: imagesDatabase.linenWhite },
      { attributes: { size: "M", color: "Off-White" }, price: { amount: 2599, currency: "INR" }, stock: 20, images: imagesDatabase.linenWhite },
      { attributes: { size: "L", color: "Off-White" }, price: { amount: 2699, currency: "INR" }, stock: 14, images: imagesDatabase.linenWhite }
    ]
  },
  {
    title: "Ecomfy Heavyweight Fleece Joggers v2",
    description: "Crafted from heavyweight brushed cotton fleece. Featuring flatlock stitching, deep side welt pockets, and heavy-duty cotton waist ties.",
    price: { amount: 2499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop" }],
    attributes: { Material: "420GSM Brushed Cotton Fleece", Fit: "Relaxed Jogger", Origin: "Made in India" },
    variant: [
      { attributes: { size: "S", color: "Heather Grey" }, price: { amount: 2499, currency: "INR" }, stock: 25, images: imagesDatabase.joggerGrey },
      { attributes: { size: "M", color: "Heather Grey" }, price: { amount: 2499, currency: "INR" }, stock: 40, images: imagesDatabase.joggerGrey },
      { attributes: { size: "L", color: "Heather Grey" }, price: { amount: 2599, currency: "INR" }, stock: 30, images: imagesDatabase.joggerGrey },
      { attributes: { size: "S", color: "Vintage Slate" }, price: { amount: 2699, currency: "INR" }, stock: 20, images: imagesDatabase.joggerSlate },
      { attributes: { size: "M", color: "Vintage Slate" }, price: { amount: 2699, currency: "INR" }, stock: 35, images: imagesDatabase.joggerSlate },
      { attributes: { size: "L", color: "Vintage Slate" }, price: { amount: 2799, currency: "INR" }, stock: 25, images: imagesDatabase.joggerSlate }
    ]
  },
  {
    title: "Ecomfy Double-Layer Mesh Shorts v2",
    description: "Premium double-layer athletic mesh shorts. Engineered with elastic waistbands, custom knit ribbed borders, and zippered pockets.",
    price: { amount: 1699, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Heavyweight Double-Layer Mesh", Fit: "Above the Knee Boxy", Origin: "Made in India" },
    variant: [
      { attributes: { size: "S", color: "Royal Blue" }, price: { amount: 1699, currency: "INR" }, stock: 30, images: imagesDatabase.shortsBlue },
      { attributes: { size: "M", color: "Royal Blue" }, price: { amount: 1699, currency: "INR" }, stock: 40, images: imagesDatabase.shortsBlue },
      { attributes: { size: "L", color: "Royal Blue" }, price: { amount: 1799, currency: "INR" }, stock: 25, images: imagesDatabase.shortsBlue },
      { attributes: { size: "S", color: "Emerald" }, price: { amount: 1799, currency: "INR" }, stock: 25, images: imagesDatabase.shortsEmerald },
      { attributes: { size: "M", color: "Emerald" }, price: { amount: 1799, currency: "INR" }, stock: 35, images: imagesDatabase.shortsEmerald },
      { attributes: { size: "L", color: "Emerald" }, price: { amount: 1899, currency: "INR" }, stock: 20, images: imagesDatabase.shortsEmerald }
    ]
  }
];

const appendDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    console.log("Checking if studio seller user exists...");
    let seller = await userModel.findOne({ email: demoSeller.email });

    if (!seller) {
      console.log("Creating studio seller...");
      seller = new userModel(demoSeller);
      await seller.save();
    }

    console.log(`Inserting ${newProducts.length} new products into database...`);
    const productsToSave = newProducts.map((p) => ({
      ...p,
      seller: seller._id,
    }));

    const result = await Product.insertMany(productsToSave);
    console.log(`Successfully added ${result.length} new products with multi-image variants directly to the database!`);
    process.exit(0);
  } catch (error) {
    console.error("Error adding products to database:", error);
    process.exit(1);
  }
};

appendDatabase();
