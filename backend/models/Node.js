const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  nodeId: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true, min: 1, max: 8 },
  companion: { type: Object, default: {} },
  verbatim: {
    quote: { type: String, default: '' },
    interpretation: { type: String, default: '' },
  },
  scoredBy: { type: String },
  scoredAt: { type: Date, default: Date.now },
});

nodeSchema.index({ accountId: 1, nodeId: 1 }, { unique: true });

module.exports = mongoose.model('Node', nodeSchema);
