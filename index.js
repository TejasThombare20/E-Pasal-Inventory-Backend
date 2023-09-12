const getconnection = require("./db");
const express = require("express");
const { Storage } = require("@google-cloud/storage");
const mongoose = require("mongoose");
const { format } = require("util");
const Multer = require("multer");
const path = require("path");
const cors = require("cors");
const passport = require("passport");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid"); 

dotenv.config();
getconnection();
const app = express();
const port = process.env.PORT;
const corsOptions = {
  // origin: 'https://e-pasal-inventory-frontend.vercel.app',
  origin: "http://localhost:3000",
  credentials: true,
  // Add these headers to allow specific HTTP methods and headers
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization,authtoken",
  optionsSuccessStatus: 200,
};
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
app.use(cors(corsOptions));
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());

// const keyfilename = path.join(__dirname, 'config', 'gcs.json');

const cloudStorage = new Storage({
  keyFilename: path.join(__dirname, 'config', 'e-pasal_gcs.json'),
  projectId: "epasal-product-library",
});

const bucketName = "e-pasal_product";

const bucket = cloudStorage.bucket(bucketName);

app.post("/api/uploadimage", multer.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(404).send("No file uploaded");
      return;
    }
    
    const uniqueFilename = `${uuidv4()}`
  
    // const blob = bucket.file(req.file.originalname);
    const blob = bucket.file(uniqueFilename);

    
    // const blobStream = blob.createWriteStream();
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: "image", 
      },
    });

    blobStream.on("error", (err) => {
      next(err);
    });
    blobStream.on("finish", () => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );
      res.status(200).json({ publicUrl });
    });
  
    blobStream.end(req.file.buffer);
    // console.log(req.file);
    
  } catch (error) {
    console.log(error)
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", require("./Routes/Authentication"));
app.use("/api/product", require("./Routes/Product_op"));
app.use("/api/category", require("./Routes/Category_op"));
app.use("/api/unit", require("./Routes/unit_op"));
// app.use("/api/uploadimage", require("./Routes/uploadImg"));

const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "293814315724-uh1nc79um836f4ttt27sjgr2olamfoja.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:5000/api/auth/google/callback", // Your callback URL
    },
    (accessToken, refreshToken, profile, done) => {
      // Store the access token securely, e.g., in a session
      // Call done() to finish the authentication process
      done(null, profile);
    }
  )
);
// Initialize Passport
app.use(passport.initialize());

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after successful authentication
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const accessToken = req.user.accessToken;
    // Redirect to the desired page after successful authentication
    res.redirect("/");
  }
);

app.listen(port, () => {
  console.log(`Server is running  on port http://localhost:${port}`);
});
