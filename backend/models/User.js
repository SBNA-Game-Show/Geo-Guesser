const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  score: { type: Number, default: 0 }  // ✅ must exist
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);