const mongoose = require('mongoose')
const { Schema } = mongoose;
const UserSchema = new Schema({
    first_name:{
        type : String,
        required : true
    },
    
    last_name:{
        type : String
    },
    
    email:{
        type : String,
        required : true,
        unique : true
    },
    password:{
        type : String,
        required : true

    },
    
    date:{
        type : Date,
        default : Date.now

    },
    image:{
     type : String,
     required : true
     
    }

    
  }); 
  const User = mongoose.model('User',UserSchema);
//   User.createIndexes();
  module.exports = User;