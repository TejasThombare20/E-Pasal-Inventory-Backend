const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  product_name: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  sub_category: {
    type: String,
    required : true,
  },

  sub_sub_category :{
      type : String
  },

  image: {
    type: String,
    required: true,
  },
  barcode : {
    type: String,
  },
  quantity: {
    type: String,
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
  date: {
    type: Date,
    default: Date.now,
  },
});
const Product = mongoose.model("Product", UserSchema);
//   User.createIndexes();
module.exports = Product;
