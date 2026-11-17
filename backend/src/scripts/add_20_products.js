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
    title: "Ecomfy Heavyweight Oversized Hoodie",
    description: "Ultra-thick, luxurious 450GSM cotton fleece hoodie featuring a double-lined hood without drawcords for a clean aesthetic. Dropped shoulders and relaxed body construct the perfect modern silhouette.",
    price: { amount: 3499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop" }],
    attributes: { Material: "450GSM Cotton Fleece", Fit: "Oversized", Origin: "Made in India", Wash: "Cold Wash Only" },
    variant: [
      { attributes: { size: "S", color: "Acid Wash Black" }, stock: 15 },
      { attributes: { size: "M", color: "Acid Wash Black" }, stock: 25 },
      { attributes: { size: "L", color: "Acid Wash Black" }, stock: 20 },
      { attributes: { size: "S", color: "Desert Sand" }, stock: 10 },
      { attributes: { size: "M", color: "Desert Sand" }, stock: 18 },
      { attributes: { size: "L", color: "Desert Sand" }, stock: 12 }
    ]
  },
  {
    title: "Ecomfy Distressed Carpenter Jeans",
    description: "Constructed from heavy 12oz denim. Featuring a relaxed straight fit with classic carpenter utility pockets and a hammer loop. Subtle hand-distressed detailing around the cuffs and pockets.",
    price: { amount: 2799, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop" }],
    attributes: { Material: "12oz Denim", Fit: "Relaxed Straight", Origin: "Made in India", Pockets: "7 Utility Pockets" },
    variant: [
      { attributes: { size: "30", color: "Vintage Blue" }, stock: 8 },
      { attributes: { size: "32", color: "Vintage Blue" }, stock: 15 },
      { attributes: { size: "34", color: "Vintage Blue" }, stock: 10 },
      { attributes: { size: "30", color: "Charcoal" }, stock: 12 },
      { attributes: { size: "32", color: "Charcoal" }, stock: 20 },
      { attributes: { size: "34", color: "Charcoal" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Waffle Knit Longsleeve",
    description: "Heavy textured thermal longsleeve shirt in a boxy fit. Wide ribbed cuffs and collar add a classic vintage structure.",
    price: { amount: 1699, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop" }],
    attributes: { Material: "100% Waffle Cotton", Fit: "Boxy", Wash: "Machine wash cold", Weight: "280GSM" },
    variant: [
      { attributes: { size: "S", color: "Olive" }, stock: 15 },
      { attributes: { size: "M", color: "Olive" }, stock: 22 },
      { attributes: { size: "L", color: "Olive" }, stock: 12 },
      { attributes: { size: "S", color: "Oatmeal" }, stock: 14 },
      { attributes: { size: "M", color: "Oatmeal" }, stock: 25 },
      { attributes: { size: "L", color: "Oatmeal" }, stock: 18 }
    ]
  },
  {
    title: "Ecomfy Nylon Cargo Trackpants",
    description: "Water-resistant matte Taslan nylon trackpants featuring large zippered cargo pockets, adjustable drawstrings at the ankles, and a comfortable elastic waistband.",
    price: { amount: 2499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Taslan Nylon", Fit: "Regular", Finish: "Water-resistant Matte", Origin: "Made in India" },
    variant: [
      { attributes: { size: "S", color: "Steel Grey" }, stock: 20 },
      { attributes: { size: "M", color: "Steel Grey" }, stock: 30 },
      { attributes: { size: "L", color: "Steel Grey" }, stock: 15 },
      { attributes: { size: "S", color: "Noir" }, stock: 25 },
      { attributes: { size: "M", color: "Noir" }, stock: 35 },
      { attributes: { size: "L", color: "Noir" }, stock: 20 }
    ]
  },
  {
    title: "Ecomfy Boxy Denim Jacket",
    description: "Classic streetwear silhouette jacket crafted from rigid 14oz stone-washed denim. Featuring pleated chest details and adjustable waist buttons.",
    price: { amount: 3999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop" }],
    attributes: { Material: "14oz Rigid Denim", Fit: "Boxy Short", Wash: "Stone Wash", Origin: "Made in India" },
    variant: [
      { attributes: { size: "M", color: "Indigo" }, stock: 10 },
      { attributes: { size: "L", color: "Indigo" }, stock: 14 },
      { attributes: { size: "XL", color: "Indigo" }, stock: 6 },
      { attributes: { size: "M", color: "Bleach Wash" }, stock: 8 },
      { attributes: { size: "L", color: "Bleach Wash" }, stock: 12 },
      { attributes: { size: "XL", color: "Bleach Wash" }, stock: 4 }
    ]
  },
  {
    title: "Ecomfy Ribbed Mockneck Sweater",
    description: "Fine knit cotton-acrylic blend sweater featuring a snug mockneck and thick ribbed cuffs. Excellent for layering under overcoats.",
    price: { amount: 2299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Cotton-Acrylic Blend", Fit: "Slim Fit Mockneck", Wash: "Dry Clean Recommended", Detail: "Ribbed Collar" },
    variant: [
      { attributes: { size: "M", color: "Cocoa" }, stock: 12 },
      { attributes: { size: "L", color: "Cocoa" }, stock: 18 },
      { attributes: { size: "XL", color: "Cocoa" }, stock: 10 },
      { attributes: { size: "M", color: "Cream" }, stock: 15 },
      { attributes: { size: "L", color: "Cream" }, stock: 22 },
      { attributes: { size: "XL", color: "Cream" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Oversized Flannel Shacket",
    description: "Heavy flannel jacket-shirt hybrid. Made with double-brushed cotton flannel fabric. Dual chest button-flap pockets and a curved shirt hem.",
    price: { amount: 1999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Double-Brushed Cotton Flannel", Fit: "Relaxed Shacket", Wash: "Machine wash cold", Origin: "Made in India" },
    variant: [
      { attributes: { size: "M", color: "Red Plaid" }, stock: 18 },
      { attributes: { size: "L", color: "Red Plaid" }, stock: 25 },
      { attributes: { size: "XL", color: "Red Plaid" }, stock: 12 },
      { attributes: { size: "M", color: "Forest Plaid" }, stock: 14 },
      { attributes: { size: "L", color: "Forest Plaid" }, stock: 20 },
      { attributes: { size: "XL", color: "Forest Plaid" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Technical Utility Vest",
    description: "Ripstop utility vest equipped with multi-zip cargo storage pockets and adjustable waist straps. Elevates any basic hoodie or tee look instantly.",
    price: { amount: 1799, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Reinforced Ripstop Nylon", Fit: "Adjustable Fit", Pockets: "4 Front Utility Pockets", Style: "Tactical Vest" },
    variant: [
      { attributes: { size: "One Size", color: "Tactical Black" }, stock: 40 },
      { attributes: { size: "One Size", color: "Olive Green" }, stock: 30 }
    ]
  },
  {
    title: "Ecomfy Puffer Jacket Drop v2",
    description: "Super puffed insulated winter jacket featuring synthetic down fill, a detachable hood, fleece-lined handwarmer pockets, and high wind resistance.",
    price: { amount: 4599, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Waterproof Polyester Shell", Insulation: "Synthetic Down Fill", Fit: "Puffy Regular", Warmth: "Sub-zero Rated" },
    variant: [
      { attributes: { size: "M", color: "Matte Noir" }, stock: 15 },
      { attributes: { size: "L", color: "Matte Noir" }, stock: 20 },
      { attributes: { size: "XL", color: "Matte Noir" }, stock: 10 },
      { attributes: { size: "M", color: "Gloss Silver" }, stock: 8 },
      { attributes: { size: "L", color: "Gloss Silver" }, stock: 12 },
      { attributes: { size: "XL", color: "Gloss Silver" }, stock: 5 }
    ]
  },
  {
    title: "Ecomfy Knit Polo Shirt",
    description: "Retro camp-collar knit polo crafted from breathable fine-gauge cotton yarns. Featuring ribbed collar borders and knit patterns.",
    price: { amount: 1899, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop" }],
    attributes: { Material: "100% Fine Cotton Yarns", Fit: "Retro Boxy", Collar: "Camp Collar", Wash: "Flat Dry Only" },
    variant: [
      { attributes: { size: "S", color: "Sage" }, stock: 12 },
      { attributes: { size: "M", color: "Sage" }, stock: 18 },
      { attributes: { size: "L", color: "Sage" }, stock: 10 },
      { attributes: { size: "S", color: "Navy" }, stock: 15 },
      { attributes: { size: "M", color: "Navy" }, stock: 22 },
      { attributes: { size: "L", color: "Navy" }, stock: 14 }
    ]
  },
  {
    title: "Ecomfy Vintage Graphic Tee",
    description: "240GSM heavyweight graphic tee with vintage washed effect. Distressed screen-printed artwork across the chest.",
    price: { amount: 1299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop" }],
    attributes: { Material: "240GSM Heavy Cotton", Fit: "Streetwear Oversized", Print: "Vintage Screen Print", Wash: "Wash inside out" },
    variant: [
      { attributes: { size: "S", color: "Off-White" }, stock: 30 },
      { attributes: { size: "M", color: "Off-White" }, stock: 45 },
      { attributes: { size: "L", color: "Off-White" }, stock: 35 },
      { attributes: { size: "XL", color: "Off-White" }, stock: 20 },
      { attributes: { size: "S", color: "Faded Indigo" }, stock: 25 },
      { attributes: { size: "M", color: "Faded Indigo" }, stock: 40 },
      { attributes: { size: "L", color: "Faded Indigo" }, stock: 30 },
      { attributes: { size: "XL", color: "Faded Indigo" }, stock: 15 }
    ]
  },
  {
    title: "Ecomfy Leather Flight Jacket",
    description: "Vegan PU leather aviator jacket featuring plush faux-shearling collar and warm quilted satin lining. Heavy-duty metal zippers.",
    price: { amount: 5499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Vegan PU Leather", Fit: "Flight Bomber Fit", Lining: "Quilted Satin Lining", Warmth: "High Insulation" },
    variant: [
      { attributes: { size: "M", color: "Espresso" }, stock: 8 },
      { attributes: { size: "L", color: "Espresso" }, stock: 12 },
      { attributes: { size: "XL", color: "Espresso" }, stock: 6 },
      { attributes: { size: "M", color: "Obsidian" }, stock: 10 },
      { attributes: { size: "L", color: "Obsidian" }, stock: 15 },
      { attributes: { size: "XL", color: "Obsidian" }, stock: 8 }
    ]
  },
  {
    title: "Ecomfy Corduroy Overshirt",
    description: "Relaxed-fit overshirt crafted from soft, thick 8-wales corduroy fabric. Horn buttons and dual drop chest pockets.",
    price: { amount: 1799, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop" }],
    attributes: { Material: "8-Wales Premium Corduroy", Fit: "Relaxed Overshirt", Origin: "Made in India", Buttons: "Horn Buttons" },
    variant: [
      { attributes: { size: "M", color: "Rust" }, stock: 15 },
      { attributes: { size: "L", color: "Rust" }, stock: 22 },
      { attributes: { size: "XL", color: "Rust" }, stock: 10 },
      { attributes: { size: "M", color: "Sage Green" }, stock: 18 },
      { attributes: { size: "L", color: "Sage Green" }, stock: 25 },
      { attributes: { size: "XL", color: "Sage Green" }, stock: 12 }
    ]
  },
  {
    title: "Ecomfy Double-Knee Pants",
    description: "Highly durable double-knee pants crafted from 100% Cotton Duck Canvas. Features reinforced utility thigh panels and brass rivet details.",
    price: { amount: 2699, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop" }],
    attributes: { Material: "100% Cotton Duck Canvas", Fit: "Straight Fit", Detail: "Double-Knee Reinforcements", Origin: "Made in India" },
    variant: [
      { attributes: { size: "30", color: "Brown Duck" }, stock: 12 },
      { attributes: { size: "32", color: "Brown Duck" }, stock: 20 },
      { attributes: { size: "34", color: "Brown Duck" }, stock: 15 },
      { attributes: { size: "30", color: "Off-Black" }, stock: 18 },
      { attributes: { size: "32", color: "Off-Black" }, stock: 25 },
      { attributes: { size: "34", color: "Off-Black" }, stock: 12 }
    ]
  },
  {
    title: "Ecomfy Terry Resort Shirt",
    description: "Crafted from highly absorbent plush terry cloth towelling fabric. Features an open Cuban camp collar and comfortable fit.",
    price: { amount: 1599, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Terry Towelling Cotton", Fit: "Cuban Collar Relaxed", Wash: "Machine wash cold", Style: "Resortwear" },
    variant: [
      { attributes: { size: "S", color: "Coconut" }, stock: 20 },
      { attributes: { size: "M", color: "Coconut" }, stock: 30 },
      { attributes: { size: "L", color: "Coconut" }, stock: 15 },
      { attributes: { size: "S", color: "Sky Blue" }, stock: 15 },
      { attributes: { size: "M", color: "Sky Blue" }, stock: 25 },
      { attributes: { size: "L", color: "Sky Blue" }, stock: 12 }
    ]
  },
  {
    title: "Ecomfy Quilted Bomber",
    description: "Diamond quilted lightweight bomber jacket featuring thin insulation lining and comfortable stretch-ribbed collar and waist.",
    price: { amount: 2999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Satin Polyester Shell", Pattern: "Diamond Quilted", Fit: "Classic Bomber", Warmth: "Medium Insulation" },
    variant: [
      { attributes: { size: "M", color: "Olive Drab" }, stock: 14 },
      { attributes: { size: "L", color: "Olive Drab" }, stock: 18 },
      { attributes: { size: "XL", color: "Olive Drab" }, stock: 8 },
      { attributes: { size: "M", color: "Black Pearl" }, stock: 15 },
      { attributes: { size: "L", color: "Black Pearl" }, stock: 22 },
      { attributes: { size: "XL", color: "Black Pearl" }, stock: 10 }
    ]
  },
  {
    title: "Ecomfy Waxed Cotton Jacket",
    description: "Classic military field coat design. Cut from weather-resistant waxed cotton canvas, complete with four pockets and corduroy collar trim.",
    price: { amount: 4299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Waxed Canvas Cotton", Fit: "Regular Utility Coat", Finish: "Water-resistant Wax Coating", Pockets: "4 Cargo Pockets" },
    variant: [
      { attributes: { size: "M", color: "Tan" }, stock: 10 },
      { attributes: { size: "L", color: "Tan" }, stock: 15 },
      { attributes: { size: "XL", color: "Tan" }, stock: 6 },
      { attributes: { size: "M", color: "Dark Spruce" }, stock: 8 },
      { attributes: { size: "L", color: "Dark Spruce" }, stock: 12 },
      { attributes: { size: "XL", color: "Dark Spruce" }, stock: 5 }
    ]
  },
  {
    title: "Ecomfy Linen Drawstring Pants",
    description: "Breathable pure linen trousers featuring an elastic waistband and drawstring ties. Relaxed loose legs for hot summer days.",
    price: { amount: 1999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop" }],
    attributes: { Material: "100% Linen", Fit: "Loose Drawstring Fit", Wash: "Cold Hand Wash Recommended", Rise: "Mid Rise" },
    variant: [
      { attributes: { size: "S", color: "Natural Sand" }, stock: 15 },
      { attributes: { size: "M", color: "Natural Sand" }, stock: 25 },
      { attributes: { size: "L", color: "Natural Sand" }, stock: 18 },
      { attributes: { size: "S", color: "Off-White" }, stock: 12 },
      { attributes: { size: "M", color: "Off-White" }, stock: 20 },
      { attributes: { size: "L", color: "Off-White" }, stock: 14 }
    ]
  },
  {
    title: "Ecomfy Heavyweight Joggers",
    description: "Comfy streetwear sweatpants made from thick 400GSM brushed cotton fleece. Detailed with heavy waistband drawstrings and cuffed ankles.",
    price: { amount: 2199, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop" }],
    attributes: { Material: "400GSM Cotton Fleece", Fit: "Cuffed Jogger Fit", Waist: "Elastic Drawstring", Origin: "Made in India" },
    variant: [
      { attributes: { size: "S", color: "Heather Grey" }, stock: 25 },
      { attributes: { size: "M", color: "Heather Grey" }, stock: 40 },
      { attributes: { size: "L", color: "Heather Grey" }, stock: 30 },
      { attributes: { size: "S", color: "Vintage Slate" }, stock: 20 },
      { attributes: { size: "M", color: "Vintage Slate" }, stock: 35 },
      { attributes: { size: "L", color: "Vintage Slate" }, stock: 25 }
    ]
  },
  {
    title: "Ecomfy Basketball Shorts",
    description: "Authentic double-layer athletic mesh shorts featuring a loose cut, ribbed waist borders, and high breathability.",
    price: { amount: 1499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop" }],
    attributes: { Material: "Double-Layer Athletic Mesh", Fit: "Relaxed Above Knee", Wash: "Machine wash warm", Origin: "Made in India" },
    variant: [
      { attributes: { size: "S", color: "Royal Blue" }, stock: 30 },
      { attributes: { size: "M", color: "Royal Blue" }, stock: 40 },
      { attributes: { size: "L", color: "Royal Blue" }, stock: 25 },
      { attributes: { size: "S", color: "Emerald" }, stock: 25 },
      { attributes: { size: "M", color: "Emerald" }, stock: 35 },
      { attributes: { size: "L", color: "Emerald" }, stock: 20 }
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
