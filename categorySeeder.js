const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/category"); // adjust path if needed

dotenv.config();

const categories = [
  {
    name: "Web Development",
    description:
      "Resources, templates, and tools for front-end and back-end development.",
    image: {
      public_id: "web_dev",
      url: "https://imgs.search.brave.com/QKT5m1UF0DxZM0cunI7Cp0s-7gPXyEjU2gVYjP6PDLo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/Y3JlYXRlLnZpc3Rh/LmNvbS9hcGkvbWVk/aWEvc21hbGwvNjE3/NDg0Mzg2L3N0b2Nr/LXBob3RvLWp1bmlv/ci1kZXZlbG9wZXItcHJvZ3JhbW1pbmctY29kZS10ZXJtaW5hbC13aW5kb3ctdHlwaW5nLXNlcnZlci1pbmZvcm1hdGlvbi1jb21wdXRlcg",
    },
  },
  {
    name: "App Development",
    description: "Everything for iOS and Android development.",
    image: {
      public_id: "app_dev",
      url: "https://imgs.search.brave.com/yAykLROysDtILleGqKSerMuXThgWnCq6g_mhL90YB4k/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG5p/Lmljb25zY291dC5j/b20vaWxsdXN0cmF0/aW9uL3ByZW1pdW0v/dGh1bWIvbWFsZS1k/ZXZlbG9wZXItcHJv/Z3JhbW1pbmctbW9i/aWxlLWFwcC1pbGx1/c3RyYXRpb24tZG93/bmxvYWQtaW4tc3Zn/LXBuZy1naWYtZmls/ZS1mb3JtYXRzLS1k/ZXZlbG9wbWVudC1j/b2RpbmctYnVzaW5l/c3MtdGVjaG5vbG9n/eS1wYWNrLWlsbHVz/dHJhdGlvbnMtNTYx/ODYzOS5wbmc_Zj13/ZWJw",
    },
  },
  {
    name: "Electronics",
    description: "Laptops, gadgets, and smart tech products.",
    image: {
      public_id: "electronics",
      url: "https://imgs.search.brave.com/9ZPzIhhM0z6G1ZkZxxOiUMJ__8lJ25GJ87KYYCfVoeA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNjEv/OTAyLzEzMi9zbWFs/bC9sYXJnZS1lbGVj/dHJvbmljcy1zdG9y/ZS1kaXNwbGF5aW5n/LXZhcmlvdXMtY29u/c3VtZXItZWxlY3Ry/b25pY3MtcHJvZHVj/dHMtcGhvdG8uanBn",
    },
  },
  {
    name: "Home Decor",
    description: "Stylish furniture, lighting, and accessories.",
    image: {
      public_id: "home_decor",
      url: "https://imgs.search.brave.com/yuOFeRA0TeFo6C4nt2R6UXivmWfsYB6dM-kSPW8w3pc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTA5/OTgxNi9wZXhlbHMt/cGhvdG8tMTA5OTgx/Ni5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdz01MDA",
    },
  },
  {
    name: "Travelling",
    description: "Gear, guides, and accessories for travelers.",
    image: {
      public_id: "travel",
      url: "https://imgs.search.brave.com/7RChxvpQQ7kWb_8-EsSiC8gv4nkFAKXnZHbIyTpzKXQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5jYW52/YS5jb20vSXZUNWMv/TUFFVlBTSXZUNWMv/MS90bC9jYW52YS10/cmF2ZWxpbmctYWNj/ZXNzb3JpZXMtYWJv/dmUtbWFwLU1BRVZQ/U0l2VDVjLmpwZw",
    },
  },
  {
    name: "Mobile Accessories",
    description: "Chargers, cases, holders and other accessories.",
    image: {
      public_id: "mobile_accessories",
      url: "https://imgs.search.brave.com/pNSuE-uzIrAc37-j3nZTL3cbZyfREE3jDAK8pVhpTTE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS1w/aG90by9tb2JpbGUt/YWNjZXNzb3JpZXMt/aW5jbHVkZS13aGl0/ZS1ibGFjay0yNjBu/dy0xNzgwODcwODY1/LmpwZw",
    },
  },
  {
    name: "Gaming",
    description: "Consoles, accessories, and game titles.",
    image: {
      public_id: "gaming",
      url: "https://res.cloudinary.com/demo/image/upload/v1690000000/gaming.jpg",
    },
  },
  {
    name: "Books & Study Material",
    description: "Educational books, novels, and exam prep.",
    image: {
      public_id: "books",
      url: "https://res.cloudinary.com/demo/image/upload/v1690000000/books.jpg",
    },
  },
  {
    name: "Health & Fitness",
    description: "Workout gear, supplements, and accessories.",
    image: {
      public_id: "fitness",
      url: "https://res.cloudinary.com/demo/image/upload/v1690000000/fitness.jpg",
    },
  },
  {
    name: "Fashion",
    description: "Clothing, shoes, and style essentials.",
    image: {
      public_id: "fashion",
      url: "https://res.cloudinary.com/demo/image/upload/v1690000000/fashion.jpg",
    },
  },
  {
    name: "Digital Courses",
    description: "Courses on coding, design, business, and more.",
    image: {
      public_id: "courses",
      url: "https://res.cloudinary.com/demo/image/upload/v1690000000/courses.jpg",
    },
  },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    await Category.deleteMany(); // Clear old data
    console.log("🧹 Old categories cleared");

    const result = await Category.insertMany(categories);
    console.log(`🌱 Seeded ${result.length} categories`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

seedCategories();
