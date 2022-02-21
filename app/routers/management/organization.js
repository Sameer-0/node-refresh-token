const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const organization = require('../../controllers/management/organization');
const validate = require('../../middlewares/validate')


// ORGANIZATION ROUTER
router.get('/organizations', organization.getPage)
router.post('/organizations', validate('JsonValidator'), organization.create)
router.put('/organizations', validate('JsonValidator'), organization.update)
router.delete('/organizations',  organization.delete)
router.patch('/organizations',  organization.deleteAll)
router.post('/organization/pagination', validate('pagination'), organization.getPage)
router.post('/organization/single', validate('single'), organization.single)
router.post('/organization/search', validate('search'), organization.search)


module.exports = router;