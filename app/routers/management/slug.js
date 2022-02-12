const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const slug = require('../../controllers/management/slug');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

//SLUG ROUTER
router.get('/slug', slug.getPage)
router.post('/slug', validate('createSlug'), slug.create)
router.put('/slug', validate('updateSlug'), slug.update)
router.delete('/slug', validate('delete'), slug.delete)
router.get('/slug/single', validate('single'), slug.single)
router.get('/slug/search', validate('search'), slug.search)

module.exports = router;