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
router.delete('/organizations', validate('delete'), organization.delete)
router.post('/organization/pagination', validate('pagination'), organization.getPage)
router.post('/organizations/single', validate('single'), organization.single)
router.post('/organizations/search', validate('search'), organization.search)


module.exports = router;