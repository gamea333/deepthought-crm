const express = require('express');
const path = require('path');
const fs = require('fs');
const Account = require('../models/Account');
const Node = require('../models/Node');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const seedPath = path.join(__dirname, '../data/seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

    const existing = await Account.findOne({
      companyName: seedData.account.companyName,
    });

    if (existing) {
      await Node.deleteMany({ accountId: existing._id });
      await Account.deleteOne({ _id: existing._id });
    }

    const account = await Account.create(seedData.account);

    for (const node of seedData.nodes) {
      await Node.create({
        ...node,
        accountId: account._id,
      });
    }

    res.json({
      success: true,
      accountId: account._id,
      message: 'Seeded successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
