const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const User = require("../Module/User");
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Google Drive API client
const drive = google.drive({
  version: "v3",
  auth: " ",
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    const accessToken = user.accessToken;

    // Upload image to Google Drive
    const driveResponse = await uploadImageToDrive(req.file,accessToken);

    // Update the user document with the image link
    await User.findByIdAndUpdate(userId, {
      imageLink: driveResponse.data.webContentLink,
    });

    res.status(200).json({ message: "Image link saved successfully" });
  } catch (error) {
    console.error("Error saving image link:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

async function uploadImageToDrive(file ,accessToken ) {
  try {
    // Replace 'YOUR_ACCESS_TOKEN' with your actual access token
    // const accessToken = accessToken;

    // Create the file metadata
    const fileMetadata = {
      name: file.originalname, // Use the original name of the uploaded file
    };

    // Create a media upload stream
    const media = {
      mimeType: file.mimetype,
      body: file.buffer, // Use the file buffer from multer
    };

    // Create a request to upload the file
    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      auth: accessToken,
    });

    return driveResponse;
  } catch (error) {
    console.error("Error uploading image to Google Drive:", error);
    throw error;
  }
}

module.exports = router;
