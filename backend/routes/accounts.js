const express = require('express');
const Account = require('../models/Account');
const Node = require('../models/Node');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find().select(
      '_id companyName businessDescription createdAt'
    );
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    const nodes = await Node.find({ accountId: req.params.id });
    res.json({ account, nodes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { companyName, businessDescription } = req.body;
    const account = await Account.create({ companyName, businessDescription });
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/nodes', async (req, res) => {
  try {
    const { nodes } = req.body;
    const accountId = req.params.id;

    for (const node of nodes) {
      await Node.findOneAndUpdate(
        { accountId, nodeId: node.nodeId },
        { ...node, accountId },
        { upsert: true, new: true, runValidators: true }
      );
    }

    res.json({ success: true, count: nodes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
