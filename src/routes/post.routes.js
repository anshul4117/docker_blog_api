const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const validate = require('../middlewares/validate.middleware');

// POST   /api/v1/posts       — Create a new post
router.post('/', validate.createPost, postController.createPost);

// GET    /api/v1/posts       — Get all posts (search + pagination)
router.get('/', postController.getAllPosts);

// GET    /api/v1/posts/:id   — Get a single post
router.get('/:id', postController.getPostById);

// PUT    /api/v1/posts/:id   — Full update
router.put('/:id', validate.updatePost, postController.updatePost);

// PATCH  /api/v1/posts/:id   — Partial update
router.patch('/:id', validate.partialUpdate, postController.partialUpdatePost);

// DELETE /api/v1/posts/:id   — Soft delete
router.delete('/:id', postController.deletePost);

module.exports = router;
