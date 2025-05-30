const router = require('express').Router();
const commentController = require('../controllers/commentController');
router.get('/:taskId', commentController.getCommentsForTask);
router.post('/:taskId', commentController.addComment);
module.exports = router;