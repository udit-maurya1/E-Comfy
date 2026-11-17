import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import Product from "../models/product.model.js";
import connectDB from "../config/db.js";

const demoSeller = {
  fullname: "Demo Seller",
  email: "seller@demo.com",
  password: "password123", // Will be automatically hashed by userSchema post/pre-save middleware
  contact: "9876543210",
  role: "seller",
};

const demoProducts = [
  {
    title: "Ecomfy Oversized Cotton Tee",
    description: "A trendy oversized fit cotton t-shirt with drop shoulders and breathable knit fabric. Ideal for casual streetwear styling.",
    price: { amount: 999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop" }],
    variant: [
      {
        attributes: { size: "S", color: "Black" },
        stock: 20
      },
      {
        attributes: { size: "M", color: "Black" },
        stock: 15
      },
      {
        attributes: { size: "L", color: "Black" },
        stock: 10
      },
      {
        attributes: { size: "S", color: "White" },
        stock: 25,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop"
      },
      {
        attributes: { size: "M", color: "White" },
        stock: 30,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop"
      },
      {
        attributes: { size: "L", color: "White" },
        stock: 5,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop"
      }
    ]
  },
  {
    title: "Ecomfy Premium Linen Shirt",
    description: "Perfect for warm weather, this linen casual shirt features a modern regular collar and tailored fit.",
    price: { amount: 1799, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Classic Slim Denim",
    description: "Highly durable slim-fit blue denim jeans with minor distress details and comfortable stretch styling.",
    price: { amount: 2499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop" }],
    variant: [
      {
        attributes: { size: "30", color: "Light Wash" },
        stock: 12
      },
      {
        attributes: { size: "32", color: "Light Wash" },
        stock: 8
      },
      {
        attributes: { size: "34", color: "Light Wash" },
        stock: 0
      },
      {
        attributes: { size: "30", color: "Dark Wash" },
        stock: 15,
        price: { amount: 2699, currency: "INR" }
      },
      {
        attributes: { size: "32", color: "Dark Wash" },
        stock: 18,
        price: { amount: 2699, currency: "INR" }
      }
    ]
  },
  {
    title: "Premium Matte Wall Paint",
    description: "High-coverage, low-VOC premium matte finish wall paint. Delivers a rich, non-reflective finish that hides imperfections and offers superb durability. Our default formula comes in Obsidian Black, but is also available in customized luxury drops.",
    price: { amount: 899, currency: "INR" },
    images: [
      { url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop" },
      { url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop" },
    ],
    variant: [
      {
        attributes: { size: "1L", color: "Black" },
        stock: 50
      },
      {
        attributes: { size: "4L", color: "Black" },
        price: { amount: 2999, currency: "INR" },
        stock: 20
      },
      {
        attributes: { size: "1L", color: "Blue" },
        image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600&auto=format&fit=crop",
        stock: 15
      },
      {
        attributes: { size: "4L", color: "Blue" },
        price: { amount: 3299, currency: "INR" },
        image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600&auto=format&fit=crop",
        stock: 8
      },
      {
        attributes: { size: "10L", color: "Blue" },
        price: { amount: 6999, currency: "INR" },
        image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600&auto=format&fit=crop",
        stock: 0
      }
    ]
  },
  {
    title: "Ecomfy Vintage Corduroy Jacket",
    description: "Retro-style corduroy jacket with soft lining, dual chest pockets, and durable button closures.",
    price: { amount: 3499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Cargo Utility Joggers",
    description: "Sturdy and comfortable multi-pocket cargo joggers in utility olive green with an elasticated waistband.",
    price: { amount: 1999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Minimalist Leather Sneakers",
    description: "Clean white leather sneakers with a cushioned footbed for all-day style and athletic comfort.",
    price: { amount: 2999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Knit Polo Tee",
    description: "Classy knitted polo shirt featuring a ribbed hem, lightweight weave, and subtle collar piping details.",
    price: { amount: 1499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Plaid Flannel Shirt",
    description: "Classic plaid button-down flannel shirt in red and black checker pattern. Soft-brushed for cozy wear.",
    price: { amount: 1699, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1588359348347-9bc6cbaa689f?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Bomber Jacket",
    description: "Sleek satin-finish bomber jacket with ribbed collar, utility sleeve pocket, and smooth metal zippers.",
    price: { amount: 3999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Suede Chelsea Boots",
    description: "Premium tan suede Chelsea boots with elastic side panels, back tabs, and durable crepe soles.",
    price: { amount: 4499, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Graphic Print Hoodie",
    description: "Streetwear-inspired graphic hoodie made with soft French terry cotton and a spacious kangaroo pocket.",
    price: { amount: 2199, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Smart Casual Blazer",
    description: "Unstructured slim-fit blazer in charcoal grey, ideal for layering over tees or formal button-downs.",
    price: { amount: 4999, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Distressed Denim Jacket",
    description: "Classic light wash denim jacket featuring vintage fading, metal button closures, and chest pockets.",
    price: { amount: 2799, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Relaxed Chino Shorts",
    description: "Breathable cotton chino shorts with a drawstring waist and relaxed fit for warm summer afternoons.",
    price: { amount: 1199, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Cuban Collar Resort Shirt",
    description: "Flowy printed casual shirt with a relaxed Cuban collar, lightweight fabric, and summery vibes.",
    price: { amount: 1599, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Quarter-Zip Pullover",
    description: "Cozy fleece quarter-zip pullover in navy, perfect for layering and light winter morning runs.",
    price: { amount: 1899, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Tailored Trouser Jeans",
    description: "Modern hybrid trousers featuring a denim-like look with a smart formal cut and comfortable fit.",
    price: { amount: 2299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Minimalist Loafers",
    description: "Elegant black leather loafers with a minimalist metal bit detail, perfect for smart casual styling.",
    price: { amount: 3299, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Cable Knit Cardigan",
    description: "Classic buttoned cardigan sweater in a heavy cable knit weave, featuring ribbed trims.",
    price: { amount: 2599, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop" }],
  },
  {
    title: "Ecomfy Windbreaker Raincoat",
    description: "Waterproof lightweight windbreaker with adjustable hood, zippered pockets, and elastic cuffs.",
    price: { amount: 2699, currency: "INR" },
    images: [{ url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop" }],
  },
];

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    console.log("Checking if demo seller user exists...");
    let seller = await userModel.findOne({ email: demoSeller.email });

    if (!seller) {
      console.log("Creating demo seller...");
      seller = new userModel(demoSeller);
      await seller.save();
      console.log(`Demo seller created with ID: ${seller._id}`);
    } else {
      console.log(`Demo seller already exists (ID: ${seller._id}). Updating role to seller...`);
      seller.role = "seller";
      await seller.save();
    }

    console.log(`Clearing existing products belonging to seller: ${seller.email}...`);
    const deleteResult = await Product.deleteMany({ seller: seller._id });
    console.log(`Deleted ${deleteResult.deletedCount} products.`);

    console.log("Inserting 20 demo products...");
    const productsToSave = demoProducts.map((p) => ({
      ...p,
      seller: seller._id,
    }));

    const insertedProducts = await Product.insertMany(productsToSave);
    console.log(`Successfully seeded ${insertedProducts.length} products!`);

    console.log("Database seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during database seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
