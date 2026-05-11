const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
