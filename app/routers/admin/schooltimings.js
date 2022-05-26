const router = require('express').Router();
const index =  require('../../controllers/admin/schooltimings/index')
const type =  require('../../controllers/admin/schooltimings/type')
const validate = require('../../middlewares/validate')
//INDEX
router.get('/schooltime', index.getPage)
router.post('/schooltime/create',  index.create)
router.post('/schooltime/search', index.search)
router.post('/schooltime/pagination', index.pagination)

//TYPES
router.get('/schooltime/types', type.getPage)
router.post('/schooltime/types/findone', type.findOne)
router.post('/schooltime/types', type.create)
router.post('/schooltime/types/update', type.update) 
router.post('/schooltime/types/delete', type.delete)

module.exports = router;