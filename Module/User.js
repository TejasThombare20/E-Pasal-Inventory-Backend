const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },
});
const User = mongoose.model("User", UserSchema);
//   User.createIndexes();
module.exports = User;
