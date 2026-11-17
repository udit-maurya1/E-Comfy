import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import Product from "../models/product.model.js";
import connectDB from "../config/db.js";

const demoSeller = {
  fullname: "Demo Seller",
  email: "seller@demo.com",
  password: "password123",
  contact: "9876543210",
  role: "seller",
};

const newProducts = [
  {
    title: "Ecomfy Classic Slim Chinos",
    description: "Tailored chinos in a slim fit, crafted from premium stretch cotton. Perfect for a sharp, smart-casual look.",
    price: { amount: 1499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "30", color: "Navy" }, stock: 15 },
      { attributes: { size: "32", color: "Navy" }, stock: 22 },
      { attributes: { size: "34", color: "Navy" }, stock: 8 },
      { attributes: { size: "30", color: "Khaki" }, stock: 12 },
      { attributes: { size: "32", color: "Khaki" }, stock: 18 },
      { attributes: { size: "34", color: "Khaki" }, stock: 5 }
    ]
  },
  {
    title: "Ecomfy Corduroy Button-Down",
    description: "A soft, textured corduroy casual shirt with a modern semi-spread collar. Cozy and stylish for layered looks.",
    price: { amount: 1899, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Tan" }, stock: 25 },
      { attributes: { size: "L", color: "Tan" }, stock: 15 },
      { attributes: { size: "M", color: "Forest Green" }, stock: 20 },
      { attributes: { size: "L", color: "Forest Green" }, stock: 10 }
    ]
  },
  {
    title: "Ecomfy Sherpa Lined Trucker Jacket",
    description: "Classic denim trucker jacket featuring warm, fuzzy sherpa fleece lining and dual chest pockets.",
    price: { amount: 3999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Denim Blue" }, stock: 12 },
      { attributes: { size: "L", color: "Denim Blue" }, stock: 8 },
      { attributes: { size: "XL", color: "Denim Blue" }, stock: 4 },
      { attributes: { size: "M", color: "Black" }, stock: 15, price: { amount: 4299, currency: "INR" } },
      { attributes: { size: "L", color: "Black" }, stock: 10, price: { amount: 4299, currency: "INR" } },
      { attributes: { size: "XL", color: "Black" }, stock: 2, price: { amount: 4299, currency: "INR" } }
    ]
  },
  {
    title: "Ecomfy Ribbed Crewneck Knitwear",
    description: "Warm crewneck sweater in a premium ribbed knit cotton blend, offering lightweight insulated comfort.",
    price: { amount: 2199, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "S", color: "Burgundy" }, stock: 14 },
      { attributes: { size: "M", color: "Burgundy" }, stock: 18 },
      { attributes: { size: "L", color: "Burgundy" }, stock: 8 },
      { attributes: { size: "S", color: "Camel" }, stock: 10 },
      { attributes: { size: "M", color: "Camel" }, stock: 12 },
      { attributes: { size: "L", color: "Camel" }, stock: 6 }
    ]
  },
  {
    title: "Ecomfy Urban Utility Cargoes",
    description: "Robust utility cargo trousers featuring standard multi-pocket styling and tapered ankles.",
    price: { amount: 2299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "30", color: "Olive" }, stock: 20 },
      { attributes: { size: "32", color: "Olive" }, stock: 25 },
      { attributes: { size: "34", color: "Olive" }, stock: 15 },
      { attributes: { size: "30", color: "Charcoal" }, stock: 18 },
      { attributes: { size: "32", color: "Charcoal" }, stock: 22 },
      { attributes: { size: "34", color: "Charcoal" }, stock: 12 }
    ]
  },
  {
    title: "Ecomfy Performance Training Hoodie",
    description: "Moisture-wicking active hoodie engineered for high-performance workouts or casual loungewear.",
    price: { amount: 1999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Heather Grey" }, stock: 30 },
      { attributes: { size: "L", color: "Heather Grey" }, stock: 25 },
      { attributes: { size: "XL", color: "Heather Grey" }, stock: 15 },
      { attributes: { size: "M", color: "Navy" }, stock: 20 },
      { attributes: { size: "L", color: "Navy" }, stock: 18 },
      { attributes: { size: "XL", color: "Navy" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Distressed Moto Jacket",
    description: "Edgy biker jacket featuring asymmetrical metal zippers, lapel collars, and premium faux-leather texture.",
    price: { amount: 4599, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Obsidian Black" }, stock: 10 },
      { attributes: { size: "L", color: "Obsidian Black" }, stock: 8 },
      { attributes: { size: "M", color: "Vintage Brown" }, stock: 6, price: { amount: 4799, currency: "INR" } },
      { attributes: { size: "L", color: "Vintage Brown" }, stock: 4, price: { amount: 4799, currency: "INR" } }
    ]
  },
  {
    title: "Ecomfy Smart Linen Blazer",
    description: "An unstructured linen blazer that adds a smart edge to any outfit without feeling stiff.",
    price: { amount: 4999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "L", color: "Sand" }, stock: 12 },
      { attributes: { size: "XL", color: "Sand" }, stock: 8 },
      { attributes: { size: "L", color: "Light Grey" }, stock: 10 },
      { attributes: { size: "XL", color: "Light Grey" }, stock: 6 }
    ]
  },
  {
    title: "Ecomfy Graphic Retro Band Tee",
    description: "Vintage-washed relaxed fit t-shirt with a rock music graphic print for an effortless streetwear look.",
    price: { amount: 899, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "S", color: "Charcoal" }, stock: 35 },
      { attributes: { size: "M", color: "Charcoal" }, stock: 40 },
      { attributes: { size: "L", color: "Charcoal" }, stock: 25 }
    ]
  },
  {
    title: "Ecomfy Waffle Textured Henley",
    description: "Classic long-sleeve Henley shirt featuring a textured waffle knit weave and a three-button placket.",
    price: { amount: 1299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "White" }, stock: 20 },
      { attributes: { size: "L", color: "White" }, stock: 15 },
      { attributes: { size: "M", color: "Blue" }, stock: 18 },
      { attributes: { size: "L", color: "Blue" }, stock: 12 }
    ]
  },
  {
    title: "Ecomfy Athletic Trainer Joggers",
    description: "Slim-fit technical fleece joggers built with dynamic stretch fabric and zippered side pockets.",
    price: { amount: 1799, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "S", color: "Grey" }, stock: 15 },
      { attributes: { size: "M", color: "Grey" }, stock: 22 },
      { attributes: { size: "L", color: "Grey" }, stock: 10 },
      { attributes: { size: "S", color: "Black" }, stock: 20 },
      { attributes: { size: "M", color: "Black" }, stock: 28 },
      { attributes: { size: "L", color: "Black" }, stock: 12 }
    ]
  },
  {
    title: "Ecomfy Cuban Collar Leafy Shirt",
    description: "A breezy resort shirt with a relaxed Cuban collar and vibrant leaf graphics, cut from soft viscose.",
    price: { amount: 1699, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Teal" }, stock: 18 },
      { attributes: { size: "L", color: "Teal" }, stock: 22 },
      { attributes: { size: "XL", color: "Teal" }, stock: 10 }
    ]
  },
  {
    title: "Ecomfy Fleece Quarter-Zip Pullover",
    description: "A cozy and warm quarter-zip sweater made of ultra-soft polar fleece. Great for lightweight layering.",
    price: { amount: 2499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Sage" }, stock: 16 },
      { attributes: { size: "L", color: "Sage" }, stock: 12 },
      { attributes: { size: "M", color: "Navy" }, stock: 25 },
      { attributes: { size: "L", color: "Navy" }, stock: 20 }
    ]
  },
  {
    title: "Ecomfy Waterproof Utility Anorak",
    description: "Highly functional wind and water-resistant anorak jacket with multiple storage pockets.",
    price: { amount: 3499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Yellow" }, stock: 10 },
      { attributes: { size: "L", color: "Yellow" }, stock: 8 },
      { attributes: { size: "XL", color: "Yellow" }, stock: 4 },
      { attributes: { size: "M", color: "Black" }, stock: 15 },
      { attributes: { size: "L", color: "Black" }, stock: 12 },
      { attributes: { size: "XL", color: "Black" }, stock: 6 }
    ]
  },
  {
    title: "Ecomfy Lightweight Nylon Puffer",
    description: "Compressible water-resistant nylon puffer jacket filled with vegan insulation down for thermal efficiency.",
    price: { amount: 3999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Orange" }, stock: 10 },
      { attributes: { size: "L", color: "Orange" }, stock: 6 },
      { attributes: { size: "M", color: "Royal Blue" }, stock: 12 },
      { attributes: { size: "L", color: "Royal Blue" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Canvas Low-Top Sneakers",
    description: "Classic court-style canvas sneakers with durable rubber vulcanized soles and custom laces.",
    price: { amount: 2499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "8", color: "White" }, stock: 15 },
      { attributes: { size: "9", color: "White" }, stock: 20 },
      { attributes: { size: "10", color: "White" }, stock: 10 },
      { attributes: { size: "8", color: "Black" }, stock: 12 },
      { attributes: { size: "9", color: "Black" }, stock: 18 },
      { attributes: { size: "10", color: "Black" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Suede Chelsea Boots",
    description: "Premium tan suede Chelsea boots with elastic side panels, back tabs, and durable crepe soles.",
    price: { amount: 4499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "8", color: "Tan Suede" }, stock: 8 },
      { attributes: { size: "9", color: "Tan Suede" }, stock: 12 },
      { attributes: { size: "10", color: "Tan Suede" }, stock: 5 },
      { attributes: { size: "8", color: "Dark Brown" }, stock: 6 },
      { attributes: { size: "9", color: "Dark Brown" }, stock: 10 },
      { attributes: { size: "10", color: "Dark Brown" }, stock: 4 }
    ]
  },
  {
    title: "Ecomfy Premium Leather Loafers",
    description: "Elegant, slip-on black leather loafers with hand-stitched detailing and high-traction rubber outsoles.",
    price: { amount: 3499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "9", color: "Classic Black" }, stock: 14 },
      { attributes: { size: "10", color: "Classic Black" }, stock: 10 },
      { attributes: { size: "9", color: "Burgundy" }, stock: 8 },
      { attributes: { size: "10", color: "Burgundy" }, stock: 6 }
    ]
  },
  {
    title: "Ecomfy Aviator Tinted Sunglasses",
    description: "Classic double-bar metal frames with scratch-resistant polarized lenses for ultimate sun protection.",
    price: { amount: 1299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { frame: "Gold", lens: "Green" }, stock: 20 },
      { attributes: { frame: "Gold", lens: "Grey" }, stock: 15 },
      { attributes: { frame: "Silver", lens: "Green" }, stock: 12 },
      { attributes: { frame: "Silver", lens: "Grey" }, stock: 18 }
    ]
  },
  {
    title: "Ecomfy Minimalist RFID Wallet",
    description: "Sleek, slimline wallet designed with military-grade RFID blocking technology to keep cards safe.",
    price: { amount: 999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1627124118123-24d4b789fd5a?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { material: "Leather" }, stock: 35 },
      { attributes: { material: "Carbon Fiber" }, stock: 20, price: { amount: 1299, currency: "INR" } }
    ]
  },
  {
    title: "Ecomfy Suede Streetwear Cap",
    description: "Premium five-panel cap with an adjustable brass buckle strap and embroidered logo on front.",
    price: { amount: 799, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { color: "Rust" }, stock: 25 },
      { attributes: { color: "Olive" }, stock: 30 }
    ]
  },
  {
    title: "Ecomfy Chunky Knit Winter Scarf",
    description: "An extra-long and soft knit scarf crafted from premium wool blends for sub-zero comfort.",
    price: { amount: 1199, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { color: "Mustard" }, stock: 15 },
      { attributes: { color: "Charcoal" }, stock: 20 }
    ]
  },
  {
    title: "Ecomfy Double-Breasted Classic Trench",
    description: "A signature double-breasted coat made with water-resistant cotton twill and an adjustable waist belt.",
    price: { amount: 5999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Beige" }, stock: 8 },
      { attributes: { size: "L", color: "Beige" }, stock: 10 },
      { attributes: { size: "XL", color: "Beige" }, stock: 5 },
      { attributes: { size: "M", color: "Navy" }, stock: 6 },
      { attributes: { size: "L", color: "Navy" }, stock: 8 },
      { attributes: { size: "XL", color: "Navy" }, stock: 4 }
    ]
  },
  {
    title: "Ecomfy Linen Drawstring Shorts",
    description: "Relaxed linen shorts featuring a flexible elasticated waistband and adjustable drawcords.",
    price: { amount: 1299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "S", color: "Natural Flax" }, stock: 20 },
      { attributes: { size: "M", color: "Natural Flax" }, stock: 25 },
      { attributes: { size: "L", color: "Natural Flax" }, stock: 15 },
      { attributes: { size: "S", color: "White" }, stock: 15 },
      { attributes: { size: "M", color: "White" }, stock: 18 },
      { attributes: { size: "L", color: "White" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Raw Selvedge Denim Jeans",
    description: "Premium Japanese selvedge denim, unwashed and raw, designed to break in and crease customly over time.",
    price: { amount: 2999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "30", color: "Indigo" }, stock: 15 },
      { attributes: { size: "32", color: "Indigo" }, stock: 18 },
      { attributes: { size: "34", color: "Indigo" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Smart Knit Polo Shirt",
    description: "A sleek tailored polo knitted from extra-fine mercerized cotton for a luxury satin handfeel.",
    price: { amount: 1599, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "M", color: "Tan" }, stock: 18 },
      { attributes: { size: "L", color: "Tan" }, stock: 15 },
      { attributes: { size: "XL", color: "Tan" }, stock: 10 },
      { attributes: { size: "M", color: "Sage" }, stock: 12 },
      { attributes: { size: "L", color: "Sage" }, stock: 15 },
      { attributes: { size: "XL", color: "Sage" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Graphic Streetwear Hoodie",
    description: "Heavyweight 450GSM French terry hoodie decorated with bold high-density puff print graphics.",
    price: { amount: 2299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "S", color: "Black" }, stock: 22 },
      { attributes: { size: "M", color: "Black" }, stock: 28 },
      { attributes: { size: "L", color: "Black" }, stock: 15 },
      { attributes: { size: "S", color: "Off-White" }, stock: 12, price: { amount: 2499, currency: "INR" } },
      { attributes: { size: "M", color: "Off-White" }, stock: 18, price: { amount: 2499, currency: "INR" } },
      { attributes: { size: "L", color: "Off-White" }, stock: 10, price: { amount: 2499, currency: "INR" } }
    ]
  },
  {
    title: "Ecomfy Tailored Wool-Blend Trousers",
    description: "Slim-fit trousers woven from a warm wool-blend fabric, featuring sharp front crease details.",
    price: { amount: 2799, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "30", color: "Grey" }, stock: 15 },
      { attributes: { size: "32", color: "Grey" }, stock: 18 },
      { attributes: { size: "34", color: "Grey" }, stock: 8 },
      { attributes: { size: "30", color: "Black" }, stock: 20 },
      { attributes: { size: "32", color: "Black" }, stock: 25 },
      { attributes: { size: "34", color: "Black" }, stock: 12 }
    ]
  },
  {
    title: "Ecomfy Nylon Travel Duffle Bag",
    description: "Water-resistant heavy nylon duffle bag equipped with shoe compartments and custom tech pockets.",
    price: { amount: 2999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { color: "Army Green" }, stock: 15 },
      { attributes: { color: "Stealth Black" }, stock: 25 }
    ]
  },
  {
    title: "Ecomfy Mesh Breathable Running Shoes",
    description: "Super light mesh trainers engineered with high-rebound cushioning foam soles for athletic comfort.",
    price: { amount: 3299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop" }],
    variant: [
      { attributes: { size: "8", color: "Triple Black" }, stock: 12 },
      { attributes: { size: "9", color: "Triple Black" }, stock: 18 },
      { attributes: { size: "10", color: "Triple Black" }, stock: 10 },
      { attributes: { size: "8", color: "Neon Blue" }, stock: 8, price: { amount: 3499, currency: "INR" } },
      { attributes: { size: "9", color: "Neon Blue" }, stock: 12, price: { amount: 3499, currency: "INR" } },
      { attributes: { size: "10", color: "Neon Blue" }, stock: 6, price: { amount: 3499, currency: "INR" } }
    ]
  }
];

const appendDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    console.log("Checking if demo seller user exists...");
    let seller = await userModel.findOne({ email: demoSeller.email });

    if (!seller) {
      console.log("Creating demo seller...");
      seller = new userModel(demoSeller);
      await seller.save();
    }

    console.log(`Inserting ${newProducts.length} new products into database...`);
    const productsToSave = newProducts.map((p) => ({
      ...p,
      seller: seller._id,
    }));

    const result = await Product.insertMany(productsToSave);
    console.log(`Successfully added ${result.length} new products with variants directly to the database!`);
    process.exit(0);
  } catch (error) {
    console.error("Error adding products to database:", error);
    process.exit(1);
  }
};

appendDatabase();
