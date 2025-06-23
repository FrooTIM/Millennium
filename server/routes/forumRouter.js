const Router = require('express');
const forumController = require('../controllers/forumController');
const router = new Router();


router.post('/', forumController.create);
router.get('/', forumController.getAll);

module.exports = router;
