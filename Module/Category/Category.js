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
        required: false
      },
      subsections: [String]
    }
  ]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
