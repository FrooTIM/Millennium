const Router = require('express');
const router = new Router();
const forumRouter = require('./forumRouter');
const userRouter = require('./userRouter');


router.use('/forum',forumRouter);
router.use('/user', userRouter);

module.exports = router;
