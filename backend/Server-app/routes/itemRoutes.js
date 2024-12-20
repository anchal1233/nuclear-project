const express = require('express');
const jwt = require('jsonwebtoken');
const Item = require('../models/Item');
const router = express.Router();


const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.userId = decoded.id;
    next();
  });
};


router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    const item = await Item.create({ name, description, userId: req.userId });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.get('/', authenticate, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
