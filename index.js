const getconnection = require('./db')
const express = require('express')
var cors = require('cors')
const dotenv = require('dotenv');
dotenv.config();


getconnection();
const app = express()
 const port = process.env.PORT;
 app.use(cors())


 app.get('/', (req, res) => {
   res.send('Hello World!')
 })


const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());

app.use('/api/auth', require("./Routes/Authentication"));
app.use('/api/product', require("./Routes/Product_op"));
  

 app.listen(port, () => {
   console.log(`Server is running  on port http://localhost:${port}`)
 })



      
 