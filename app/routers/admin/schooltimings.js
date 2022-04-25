const router = require('express').Router();
const index =  require('../../controllers/admin/schooltimings/index')
const type =  require('../../controllers/admin/schooltimings/type')

router.get('/schooltime', index.getPage)

module.exports = router;