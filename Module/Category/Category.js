const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sections: [
    {
      name: {
        type: String,
        required: true
      },
      subsections: [String]
    }
  ]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
