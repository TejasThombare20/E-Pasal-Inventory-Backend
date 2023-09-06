const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../Module/Product");
const Category = require("../Module/Category/Category");

// Get all product of login user using : GET /api/product/fetchAllProduct
// router.get('/fetchAllProduct', async (req, res) => {
//   try {
//     const products = await Product.find().sort({ createdAt: -1 }); // Fetch all products and sort by createdAt in descending order
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' , message : error.message });
//   }
// });

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
    // .populate("category", "name")
    // .populate("category.sections", "name")
    // .populate("category.sections.subsections", "name")
    // .exec();
    const populatedProducts = await Promise.all(
      products.map(async (product) => {
        const category = await Category.findById(product.category);
        const sections = category
          ? category.sections.id(product.sections)
          : null;
        const subsections = sections
          ? sections.subsections.id(product.subsections)
          : null;

        return {
          ...product.toObject(),
          category: category ? category.name : null,
          sections: sections ? sections.name : null,
          subsections: subsections ? subsections.name : null,
        };
      })
    );

    console.log("populatedProducts", populatedProducts);

    res.status(200).json( populatedProducts );
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// router.get("/fetchAllProduct", async (req, res) => {
//   const { page } = req.query;
//   const itemsPerPage = 10;
//   const skip = (page - 1) * itemsPerPage;

//   try {
//     const products = await Product.aggregate([
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $skip: skip,
//       },
//       {
//         $limit: itemsPerPage,
//       },
//       {
//         $lookup: {
//           from: "Category", // Name of the Category collection
//           localField: "category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       {
//         $unwind: "$category",
//       },
//       {
//         $lookup: {
//           from: "Category.sections", // Name of the Section collection
//           localField: "sections",
//           foreignField: "_id",
//           as: "sections",
//         },
//       },
//       {
//         $unwind: "$sections",
//       },
//       {
//         $lookup: {
//           from: "Category.sections.subsections", // Name of the Subsection collection
//           localField: "subsections",
//           foreignField: "_id",
//           as: "subsections",
//         },
//       },
//       {
//         $unwind: "$subsections",
//       },
//     ]);

//     console.log('products:', products);

//     res.status(200).json({ products });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });

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
        quantity,
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
        quantity,
        price,
        barcode,
        description,
      });
      const savedProduct = await product.save();

      if (savedProduct) {
        success = true;
      }
      res.json({ success, savedProduct });
      console.log("Yes");
    } catch (error) {
      // console.log(error.massage);
      res
        .status(500)
        .send({ message: "internal server error", error: error.message });
      console.log(error);
    }
  }
);

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

    // Create a new product object
    const newProduct = {};
    if (u_product_name) newProduct.product_name = u_product_name;
    if (u_category) newProduct.category = u_category;
    if (u_sub_category) newProduct.sub_category = u_sub_category;
    if (u_sub_sub_category) newProduct.sub_sub_category = u_sub_sub_category;
    if (u_image) newProduct.image = u_image;
    if (u_price) newProduct.price = u_price;
    if (u_quantity) newProduct.quantity = u_quantity;
    if (u_description) newProduct.description = u_description;
    if (u_barcode) newProduct.barcode = u_barcode;

    // Find the product to be updated and update it
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const updateObject = {};
    if (u_product_name) updateObject.product_name = u_product_name;
    if (u_category) updateObject.category = u_category;
    if (u_sub_category) updateObject.sub_category = u_sub_category;
    if (u_sub_sub_category) updateObject.sub_sub_category = u_sub_sub_category;
    if (u_image) updateObject.image = u_image;
    if (u_price) updateObject.price = u_price;
    if (u_quantity) updateObject.quantity = u_quantity;
    if (u_description) updateObject.description = u_description;
    if (u_barcode) updateObject.barcode = u_barcode;

    product = await Product.findByIdAndUpdate(req.params.id, updateObject, {
      new: true,
    });

    res.json({ product });
  } catch (error) {
    res
      .status(500)
      .send({ Message: "Internal server error", Error: error.message });
  }
});

router.delete("/deleteProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id: ", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const deletedProduct = await Product.findOneAndDelete({
      _id: id,
    });

    if (!deletedProduct) {
      return res.status(404).send("Product not found or not allowed");
    }

    res.json({ Success: "product has been deleted", product: deletedProduct });
  } catch (err) {
    // console.log(error.message);
    res.status(500).send({ msg: "Internal server error", error: err.message });
  }
});

router.get("/search", async (req, res) => {
  const { query } = req.query;

  try {
    // Use Mongoose to query the database for matching products
    const searchResults = await Product.find({
      $or: [
        { product_name: { $regex: query, $options: "i" } }, // Case-insensitive search in name
        { description: { $regex: query, $options: "i" } },
        { price: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { sub_category: { $regex: query, $options: "i" } },
        { sub_sub_category: { $regex: query, $options: "i" } },
        { quantity: { $regex: query, $options: "i" } },
        { barcode: { $regex: query, $options: "i" } },
      ],
    });

    res.json(searchResults);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

module.exports = router;
