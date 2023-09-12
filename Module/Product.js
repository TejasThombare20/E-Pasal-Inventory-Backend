const mongoose = require("mongoose");
const { Schema } = mongoose;
const Category =  require('./Category/Category')
const Unit = require('./Unit')

const productSchemma = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  product_name: {
    type: String,
    required: true,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  sections: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category.sections',
    required: false,
  },
  subsections: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Subsection model
    ref: 'Category.sections.subsections',

  },

  image: {
    type: String,
    required: true,
  },
  barcode : {
    type: String,
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref :'Unit',
    required: true,
  },

  price: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
  
});
const Product = mongoose.model("Product", productSchemma);

module.exports = Product;
