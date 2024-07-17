const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('./db');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());
app.use('/schoolImages', express.static(path.join(__dirname, 'public/schoolImages')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/schoolImages')); // Updated to use path.join
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});


const upload = multer({ storage });

app.post('/api/addSchool', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  const { name, address, city, state, contact, email_id } = req.body;
  const image = `/schoolImages/${req.file.filename}`;

  try {
    const [result] = await db.execute(
      'INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, address, city, state, contact, image, email_id]
    );
    res.status(200).json({ message: 'School added successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/getSchools', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, address, city, image FROM schools');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
