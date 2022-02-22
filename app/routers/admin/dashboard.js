const router = require('express').Router();

const dashboard = require('../../controllers/admin/dashboard');

router.get('/dashboard', dashboard.getDashboard); 

module.exports = router;