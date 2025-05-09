// server.js
const express       = require('express');
const mongoose      = require('mongoose');
const bodyParser    = require('body-parser');
const encrypt       = require('mongoose-encryption');

const app = express();
const PORT = 3000;

// ---------------------------------------------------
// 1. MongoDB Connection
// ---------------------------------------------------
mongoose.connect(
  'mongodb+srv://missari:missari123@cluster0.2uqs2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// ---------------------------------------------------
// 2. Define User Schema with Field-Level Encryption
// ---------------------------------------------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },  // this will be encrypted
});

// ─── Single Secret ──────────────────────────────────
// You can generate a long random string via, e.g.:
//   openssl rand -base64 32
// Then paste it here. Keep it secret!
const MONGO_ENC_SECRET = 'team_orange';

userSchema.plugin(encrypt, {
  secret:          MONGO_ENC_SECRET,
  encryptedFields: ['password'],
});

const User = mongoose.model('User', userSchema);

// ---------------------------------------------------
// 3. Middleware
// ---------------------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // serve index.html, login.html, etc.

// ---------------------------------------------------
// 4. Routes
// ---------------------------------------------------

// GET home
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// GET login form
app.get('/submit-form', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// POST form submission
app.post('/submit-form', async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res
      .status(400)
      .send('<h3 style="color: red;">Invalid username or password. Please try again.</h3>');
  }

  try {
    // Create & save user (password will be encrypted automatically)
    const newUser = new User({ username, password });
    await newUser.save();

    // Optional: to verify decryption, you could do:
    // const stored = await User.findOne({ username });
    // console.log('Decrypted password:', stored.password);

    // Redirect on success
    res.redirect('https://forms.gle/Pi2SW3TMmmJ7RoJH8');
  } catch (error) {
    console.error('Error saving data to MongoDB:', error);
    res
      .status(500)
      .send('<h3 style="color: red;">Server error. Please try again later.</h3>');
  }
});

// ---------------------------------------------------
// 5. Start Server
// ---------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
