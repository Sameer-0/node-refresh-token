const router = require('express').Router();
const controller = require('../controllers/user');

// router.get('/user', controller.getProfile);
router.get('/register', controller.userRegister);
router.post('/register', controller.registerUser)
router.post('/authenticate',  controller.authenticate)

router.get('/', controller.getProfile);
router.post('/getUserById', controller.getUserById);
router.put('/updateUserById', controller.updateUser);
router.post('/addUser', controller.addUser);
router.post('/deleteUser', controller.deleteUser);
router.get('/dashboard', controller.dashboard);

module.exports = router;