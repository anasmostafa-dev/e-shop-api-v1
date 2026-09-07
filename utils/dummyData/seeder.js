const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const fs = require("fs");
const slugify = require("slugify");
require("colors");
const connectedDB = require("../../config/db");
const productModel = require("../../models/productModel");

// قراءة ملف الـ JSON
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products.json"), "utf-8")
);

const insertData = async () => {
  try {
    const productsWithSlugs = products.map((product) => ({
      ...product,
      slug: slugify(product.title, { lower: true }),
    }));

    await productModel.insertMany(productsWithSlugs);
    console.log("Products Inserted Successfully!".green.inverse.bold);
    process.exit();
  } catch (error) {
    console.error(`Error inserting data: ${error}`.red.bold);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await productModel.deleteMany();
    console.log("All Products Deleted Successfully!".red.inverse.bold);
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`.red.bold);
    process.exit(1);
  }
};

const runSeeder = async () => {
  try {
    await connectedDB(); // هيقرا process.env.MONGO_URI لوحده

    if (process.argv[2] === "-i") {
      await insertData();
    } else if (process.argv[2] === "-d") {
      await destroyData();
    } else {
      console.log("Please use '-i' to insert or '-d' to delete data.".yellow);
      process.exit();
    }
  } catch (err) {
    console.error(`Execution Error: ${err}`.red.bold);
    process.exit(1);
  }
};

runSeeder();