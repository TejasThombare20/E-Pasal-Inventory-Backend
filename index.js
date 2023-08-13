const getconnection = require('./db')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv');
dotenv.config();


getconnection();
const app = express()
const port = process.env.PORT;
const corsOptions ={
    origin:'https://e-pasal-inventory-frontend.vercel.app', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
 

 app.get('/', (req, res) => {
   res.send('Hello World!')
 })


const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());

app.use('/api/auth', require("./Routes/Authentication"));
app.use('/api/product', require("./Routes/Product_op"));
app.use('/api/category', require("./Routes/Category_op"));
  

 app.listen(port, () => {
   console.log(`Server is running  on port http://localhost:${port}`)
 })



      
 