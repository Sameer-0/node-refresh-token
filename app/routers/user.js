const router = require('express').Router();
const controller = require('../controllers/user');

router.get('/user', controller.getProfile);

module.exports = router;