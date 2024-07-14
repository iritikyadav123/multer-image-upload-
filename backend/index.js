const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();

app.use(cors());

const url = "";

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const imgSchema = new mongoose.Schema({
  img: { data: Buffer, contentType: String }
});

const Image = mongoose.model("Image", imgSchema);

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded');
  }

  const img = fs.readFileSync(file.path);
  const encode_img = img.toString('base64');
  const final_img = {
    data: Buffer.from(encode_img, 'base64'),
    contentType: file.mimetype
  };

  try {
    const newImage = new Image({ img: final_img });
    await newImage.save();
    fs.unlinkSync(file.path); // Optional: Remove the file from the server after saving to the database
    res.status(200).send('File uploaded successfully');
  } catch (error) {
    console.error('Error saving image to database:', error);
    res.status(500).send('Error saving image to database');
  }
});

app.get('/images', async function(req, res) {
  try {
    const data = await Image.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).send('Error fetching images');
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
