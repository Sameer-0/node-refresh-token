const router = require('express').Router();
const controller = require('../controllers/user');
const {isLoggedIn} = require("../middlewares/user")

// router.get('/user', controller.getProfile);
router.get('/register', controller.renderRegisterPage);
router.post('/register', controller.registerUser);
router.post('/authenticate', controller.authenticate);
router.get('/profile', controller.getProfile);
router.get('/login', controller.renderLoginPage);

module.exports = router;