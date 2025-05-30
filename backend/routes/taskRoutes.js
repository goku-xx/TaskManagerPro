const router = require('express').Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Protect all routes under this router
router.use(authMiddleware);

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);

module.exports = router;
