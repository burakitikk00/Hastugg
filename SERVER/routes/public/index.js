const express = require('express');
const router = express.Router();

const dbTestRoutes = require('./test');
const contentRoutes = require('./content');
const contactRoutes = require('./contact');

router.use(dbTestRoutes);
router.use(contentRoutes);
router.use(contactRoutes);

module.exports = router;
