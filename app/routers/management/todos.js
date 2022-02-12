const router = require('express').Router();
const {
    check,
    validationResult,
    body
} = require('express-validator');

const todos = require('../../controllers/management/todos');
const validator =  require('../../middlewares/validator')
const validate = require('../../middlewares/validate')

// TODOS ROUTER
router.get('/todos', todos.getPage)
router.post('/todos/create', validate('createTodos'), todos.createTodos)
router.get('/todos/viewsingle', todos.viewDetails)
router.put('/todos/single', validate('updateTodos'), todos.updateTodosById)
router.get('/todos/single', todos.getTodosById)
router.delete('/todos/single', validate('delete'), todos.deleteTodosById)
router.get('/todos/search', validate('search'), todos.search)

module.exports = router;