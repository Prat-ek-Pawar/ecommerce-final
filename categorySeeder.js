const connectDB = require("./config/DBconnect");
const Category = require("./models/categories");

const seedCategories = async () => {
  try {
    await connectDB();

    const categories = [
      {
        name: "Electronics",
        description: "Devices and gadgets like phones, laptops, etc.",
        image: {
          public_id: "dummy_electronics_001",
          url: "https://via.placeholder.com/150?text=Electronics",
        },
      },
      {
        name: "Fashion",
        description: "Clothing and accessories",
        image: {
          public_id: "dummy_fashion_001",
          url: "https://via.placeholder.com/150?text=Fashion",
        },
      },
      {
        name: "Books",
        description: "Novels, academic books, and more",
        image: {
          public_id: "dummy_books_001",
          url: "https://via.placeholder.com/150?text=Books",
        },
      },
      {
        name: "Home Appliances",
        description: "Appliances for daily home use",
        image: {
          public_id: "dummy_appliances_001",
          url: "https://via.placeholder.com/150?text=Appliances",
        },
      },
      {
        name: "Fitness Equipment",
        description: "Gym and workout gear",
        image: {
          public_id: "dummy_fitness_001",
          url: "https://via.placeholder.com/150?text=Fitness",
        },
      },
    ];

    for (const category of categories) {
      await Category.findOneAndDelete({ name: category.name });
      await Category.create(category);
    }

    console.log(`✅ Seeded ${categories.length} categories.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding categories:", err.message);
    process.exit(1);
  }
};

seedCategories();
