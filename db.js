const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const mongooseURI = "mongodb+srv://epasalshopping:tejas@cluster0.hkqrwdi.mongodb.net/?retryWrites=true&w=majority"

const connectToMongo = () =>
{
    mongoose.connect(mongooseURI).then(()=>{
        console.log("Connection successfull")
    }).catch((err)=>{
        console.log("Connection not successfull")
    })
}
module.exports = connectToMongo;
