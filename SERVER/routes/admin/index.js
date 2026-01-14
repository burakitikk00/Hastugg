const express = require('express');
const router = express.Router();

router.use(require('./auth'));
router.use(require('./hero'));
router.use(require('./about'));
router.use(require('./services'));
router.use(require('./projects'));
router.use(require('./team'));
router.use(require('./contactInfo'));
router.use(require('./contactMessages'));
router.use(require('./analytics'));
router.use(require('./password'));
router.use(require('./emailSettings').router);
router.use(require('./testStorage'));
router.use(require('./migrateImages'));

module.exports = router;
