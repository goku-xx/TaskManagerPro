const router = require('express').Router();
const taskController = require('../controllers/taskController');
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
module.exports = router;