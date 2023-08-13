const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parentSectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
});

const SubSection = mongoose.model('SubSection', subSectionSchema);

module.exports = SubSection;
