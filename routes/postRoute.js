const router = require('express').Router();
const postController = require('../controllers/postController');

router
    .route('/')
    .get(postController.getAllPosts)
    .post(postController.createPost);

router
    .route('/:id')
    .get(postController.getOnePost)
    .patch(postController.updatePost)
    .delete(postController.deletePost);

module.exports = router;