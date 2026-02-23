const postService = require('../services/post.service');

// POST /api/v1/posts
exports.createPost = async (req, res, next) => {
    try {
        const post = await postService.createPost(req.body);
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/posts
exports.getAllPosts = async (req, res, next) => {
    try {
        const { search, page, limit } = req.query;
        const result = await postService.getAllPosts({ search, page, limit });
        res.status(200).json({
            success: true,
            count: result.posts.length,
            pagination: result.pagination,
            data: result.posts,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/posts/:id
exports.getPostById = async (req, res, next) => {
    try {
        const post = await postService.getPostById(req.params.id);
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

// PUT /api/v1/posts/:id
exports.updatePost = async (req, res, next) => {
    try {
        const post = await postService.updatePost(req.params.id, req.body);
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/v1/posts/:id
exports.partialUpdatePost = async (req, res, next) => {
    try {
        const post = await postService.partialUpdatePost(req.params.id, req.body);
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/v1/posts/:id
exports.deletePost = async (req, res, next) => {
    try {
        await postService.deletePost(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
