const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
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
      subsections: [
        {
          name : String,
        }
      ]
    }
  ]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
