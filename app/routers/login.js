const router = require('express').Router();
const { body } = require('express-validator');

const controller = require('../controllers/login');

router.get('/', controller.getLogin);
router.post('/', body('username').escape(), controller.postLogin);


module.exports = router;