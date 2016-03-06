const router = require('express').Router();
module.exports = router

router.use('/levels', require('./levels'));
router.use('/users', require('./users'));

router.use((req, res) => res.status(404).end())
