const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const Product = require("../Module/Product");

const { body, validationResult } = require("express-validator");

// Get all product of login user using : GET /api/product/fetchAllProduct
router.get("/fetchAllProduct", async (req, res) => {
  try {
    const product = await Product.find({});
    res.json(product);
  } catch (error) {
    // console.log(error.massage);
    res.status(500).send("internal server error");
  }
});

// add a new product using : POST /api/product/addProduct - login required
router.post(
  "/addProduct",

  async (req, res) => {
    try {
      let success = false;
      const { product_name, category,sub_category,sub_sub_category, image, price, quantity, description } =
        req.body;

      // console.log((req.body));

      const product = new Product({
        product_name,
        category,
        sub_category,
        sub_sub_category,
        image,
        quantity,
        price,
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



router.put('/updateProduct/:id', async (req, res) => {
  try {
      const {
          u_product_name,
          u_category,
          u_sub_category,
          u_sub_sub_category,
          u_image,
          u_price,
          u_quantity,
          u_description
      } = req.body;

      // Create a new product object
      const newProduct = {};
      if (u_product_name) newProduct.product_name = u_product_name;
      if (u_category) newProduct.category = u_category;
      if (u_sub_category) newProduct.category = u_sub_category;
      if (u_sub_sub_category) newProduct.category = u_sub_sub_category;
      if (u_image) newProduct.image = u_image;
      if (u_price) newProduct.price = u_price;
      if (u_quantity) newProduct.quantity = u_quantity;
      if (u_description) newProduct.description = u_description;

      // Find the product to be updated and update it
      let product = await Product.findById(req.params.id);

      if (!product) {
          return res.status(404).send("Product not found");
      }

      const updateObject = {};
      if (u_product_name) updateObject.product_name = u_product_name;
      if (u_category) updateObject.category = u_category; 
      if (u_sub_category) updateObject.category = u_sub_category; 
      if (u_sub_sub_category) updateObject.category = u_sub_sub_category; 
      if (u_image) updateObject.image = u_image;
      if (u_price) updateObject.price = u_price;
      if (u_quantity) updateObject.quantity = u_quantity;
      if (u_description) updateObject.description = u_description;

      product = await Product.findByIdAndUpdate(req.params.id, updateObject, { new: true });

      res.json({ product });
  } catch (error) {
      res.status(500).send({ Message: "Internal server error", Error: error.message });
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

module.exports = router;
