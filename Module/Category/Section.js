const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parentCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subsections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubSection',
    },
  ],
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
