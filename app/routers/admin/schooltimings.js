const router = require('express').Router();
const index =  require('../../controllers/admin/schooltimings/index')
const type =  require('../../controllers/admin/schooltimings/type')
const validate = require('../../middlewares/validate')
//INDEX
router.get('/schooltime', index.getPage)
router.post('/schooltime', validate('JsonValidator'), index.create)
router.get('/schooltime/search', index.search)
router.post('/schooltime/pagination', index.pagination)


//TYPES
router.get('/schooltime/types', type.getPage)
router.get('/schooltime/types/findOne', type.findOne)
router.post('/schooltime/types', type.create)
router.put('/schooltime/types', type.update)
module.exports = router;