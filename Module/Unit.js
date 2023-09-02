// models/Quantity.js
const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Unit = mongoose.model("Unit", unitSchema);

module.exports = Unit;
