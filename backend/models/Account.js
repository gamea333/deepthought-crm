const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    businessDescription: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);
