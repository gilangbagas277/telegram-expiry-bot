const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  expiryDate: { type: Date, required: true },
  isKicked: { type: Boolean, default: false }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
