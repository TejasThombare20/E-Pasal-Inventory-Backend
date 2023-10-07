const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../Module/Product");
const Category = require("../Module/Category/Category");
const Unit = require("../Module/Unit");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storage = new Storage({
  keyFilename: path.join(__dirname, "..", "config", "e-pasal_gcs.json"),
  projectId: "epasal-product-library",
});


router.get("/fetchAllProduct", async (req, res) => {
  const { page } = req.query;
  const itemsPerPage = 10; // Number of items per page
  const skip = (page - 1) * itemsPerPage; // Calculate the number of items to skip

  try {
    // Fetch the subset of products based on pagination
    const products = await Product.find()
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip(skip)
      .limit(itemsPerPage);
  
    const populatedProducts = await Promise.all(
      products.map(async (product) => {
        const category = await Category.findById(product.category);
        const sections = category
          ? category.sections.id(product.sections)
          : null;
        const subsections = sections
          ? sections.subsections.id(product.subsections)
          : null;
        const unit = await Unit.findById(product.unit);

        return {
          ...product.toObject(),
          category: category ? category.name : null,
          sections: sections ? sections.name : null,
          subsections: subsections ? subsections.name : null,
          unit: unit ? unit.name : null,
        };
      })
    );



    res.status(200).json(populatedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// add a new product using : POST /api/product/addProduct - login required
router.post(
  "/addProduct",

  async (req, res) => {
    try {
      let success = false;
      const {
        product_name,
        category,
        sections,
        subsections,
        image,
        price,
        unit,
        barcode,
        description,
      } = req.body;

      // console.log((req.body));

      const product = new Product({
        product_name,
        category,
        sections,
        subsections,
        image,
        unit,
        price,
        barcode,
        description,
      });
      const savedProduct = await product.save();

      if (savedProduct) {
        success = true;
      }
      res.json({ success, savedProduct });
    
    } catch (error) {
      // console.log(error.massage);
      res
        .status(500)
        .send({ message: "internal server error", error: error.message });
      console.log(error);
    }
  }
);
const bucketName = 'e-pasal_product';
router.put("/updateProduct/:id", async (req, res) => {
  try {
    const {
      u_product_name,
      u_category,
      u_sub_category,
      u_sub_sub_category,
      u_image,
      u_price,
      u_barcode,
      u_quantity,
      u_description,
    } = req.body;

    // Find the product to be updated
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    if (product.image) {
      // Extract the filename from the existing image URL
      const existingImageFileName = product.image.split('/').pop();

      // Delete the existing image from Google Cloud Storage
      try {
        await storage.bucket(bucketName).file(existingImageFileName).delete();
      } catch (error) {
        console.error("Error deleting existing image:", error.message);
      }
    }

    // Get the existing category, section, subsection, and unit IDs
    const currentCategory = product.category;
    const currentSection = product.sections;
    const currentSubsection = product.subsections;
    const currentUnit = product.unit;

    const updateObject = {};
    if (u_product_name) updateObject.product_name = u_product_name;
    if (u_image) updateObject.image = u_image;
    if (u_price) updateObject.price = u_price;
    if (u_quantity) updateObject.unit = u_quantity;
    if (u_description) updateObject.description = u_description;
    if (u_barcode) updateObject.barcode = u_barcode;

    // Update category, section, subsection, and unit based on IDs from the request
    updateObject.category = u_category || currentCategory;
    updateObject.sections = u_sub_category || currentSection;
    updateObject.subsections = u_sub_sub_category || currentSubsection;
    updateObject.unit = u_quantity || currentUnit; 
    
    product = await Product.findByIdAndUpdate(req.params.id, updateObject, {
      new: true,
    });

    // Fetch the names associated with the IDs
    const categoryData = await Category.findById(updateObject.category);
    const sectionData = await categoryData.sections.id(updateObject.sections);
    const subSectionData = await sectionData.subsections.id(updateObject.subsections);
    const unitData = await Unit.findById(updateObject.unit);
    const responseProduct = {
      ...product.toObject(),
      category: categoryData.name,
      sections: sectionData.name,
      subsections: subSectionData.name,
      unit: unitData.name,
    };

    console.log("responseProduct", responseProduct);

    res.json({ product: responseProduct });
  } catch (error) {
    res
      .status(500)
      .send({ Message: "Internal server error", Error: error.message });
  }
});




router.delete("/deleteProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const deletedProduct = await Product.findOneAndDelete({
      _id: id,
    });

    console.log("deletedProduct", deletedProduct);

    if (!deletedProduct) {
      return res.status(404).send("Product not found or not allowed");
    }

    const imageUrl = deletedProduct.image;

    const filename = imageUrl.replace(
      "https://storage.googleapis.com/e-pasal_product/",
      ""
    );

    // Delete the image from Google Cloud Storage
    await storage.bucket("e-pasal_product").file(filename).delete();

    res.json({ Success: "Product has been deleted", product: deletedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal server error", error: err.message });
  }
});



router.get("/search", async (req, res) => {
  const { query } = req.query;

  console.log("query", query);

  try {
    const searchProduct = [];

    // Search for products matching the query word
    const productResults = await Product.find({
      $or: [
        { product_name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { price: { $regex: query, $options: "i" } },
        { barcode: { $regex: query, $options: "i" } },
      ],
    });

    // Add products to the searchProduct array
    searchProduct.push(...productResults);

    // Search for categories matching the query word
    const categoryResults = await Category.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { "sections.name": { $regex: query, $options: "i" } }, // Search in section names
        { "sections.subsections.name": { $regex: query, $options: "i" } }, // Search in subsection names
      ],
    });
    for (const category of categoryResults) {
      const categoryProducts = await Product.find({ category: category._id });
      console.log("categoryProducts", categoryProducts);
      searchProduct.push(...categoryProducts);
    }

    console.log("searchProduct after Category : ", searchProduct);

    // Search for units matching the query word
    const unitResults = await Unit.find({
      name: { $regex: query, $options: "i" },
    });

    //  For each matching unit, find associated products and add them to the searchProduct array
    for (const unit of unitResults) {
      const unitProducts = await Product.find({ unit: unit._id });
      console.log("unitProducts", unitProducts);
      searchProduct.push(...unitProducts);
    }

    console.log("searchProduct after Unit", searchProduct);

    // Remove duplicates from the searchProduct array
    const uniqueSearchProduct = Array.from(
      new Set(searchProduct.map((product) => product._id))
    ).map((productId) =>
      searchProduct.find((product) => product._id === productId)
    );

    

    const populatedProducts = await Promise.all(
      uniqueSearchProduct.map(async (product) => {
        const category = await Category.findById(product.category);
        const sections = category
          ? category.sections.id(product.sections)
          : null;
        const subsections = sections
          ? sections.subsections.id(product.subsections)
          : null;
        const unit = await Unit.findById(product.unit);

        return {
          ...product.toObject(),
          category: category ? category.name : null,
          sections: sections ? sections.name : null,
          subsections: subsections ? subsections.name : null,
          unit: unit ? unit.name : null,
        };
      })
    );

    console.log("populatedProducts", populatedProducts);

    res.json(populatedProducts);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});



module.exports = router;
