// decrypt.js
const mongoose = require('mongoose');
const encrypt  = require('mongoose-encryption');

// 1. Copy exactly the same schema+plugin from server.js:
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const MONGO_ENC_SECRET = 'team_orange';
userSchema.plugin(encrypt, {
  secret: MONGO_ENC_SECRET,
  encryptedFields: ['password'],
});
const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect('mongodb+srv://missari:missari123@cluster0.2uqs2.mongodb.net/?retryWrites=true&w=majority');

  // 2. Query the user:
  const user = await User.findOne({ username: 'karthick' });
  if (!user) {
    console.log('User not found');
  } else {
    // 3. This is already decrypted:
    console.log('Decrypted password:', user.password);
  }

  await mongoose.disconnect();
}

run().catch(console.error);

