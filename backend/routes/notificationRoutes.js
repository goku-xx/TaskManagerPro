const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
router.get('/', notificationController.getNotifications);
module.exports = router;