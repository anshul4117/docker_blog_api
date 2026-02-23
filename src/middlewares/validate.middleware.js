const ApiError = require('../utils/ApiError');

// Validate create post request
exports.createPost = (req, res, next) => {
    const { title, content, author } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
        errors.push({ field: 'title', message: 'Title is required and must be at least 3 characters' });
    }
    if (title && title.length > 200) {
        errors.push({ field: 'title', message: 'Title cannot exceed 200 characters' });
    }
    if (!content || typeof content !== 'string' || content.trim().length < 10) {
        errors.push({ field: 'content', message: 'Content is required and must be at least 10 characters' });
    }
    if (!author || typeof author !== 'string' || author.trim().length < 2) {
        errors.push({ field: 'author', message: 'Author is required and must be at least 2 characters' });
    }
    if (author && author.length > 100) {
        errors.push({ field: 'author', message: 'Author cannot exceed 100 characters' });
    }
    if (req.body.tags && (!Array.isArray(req.body.tags) || req.body.tags.length > 10)) {
        errors.push({ field: 'tags', message: 'Tags must be an array with max 10 items' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors,
        });
    }

    next();
};

// Validate full update (PUT) — same as create
exports.updatePost = exports.createPost;

// Validate partial update (PATCH) — only validate fields that are present
exports.partialUpdate = (req, res, next) => {
    const { title, content, author, tags } = req.body;
    const errors = [];

    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length < 3) {
            errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
        }
        if (title.length > 200) {
            errors.push({ field: 'title', message: 'Title cannot exceed 200 characters' });
        }
    }
    if (content !== undefined) {
        if (typeof content !== 'string' || content.trim().length < 10) {
            errors.push({ field: 'content', message: 'Content must be at least 10 characters' });
        }
    }
    if (author !== undefined) {
        if (typeof author !== 'string' || author.trim().length < 2) {
            errors.push({ field: 'author', message: 'Author must be at least 2 characters' });
        }
        if (author.length > 100) {
            errors.push({ field: 'author', message: 'Author cannot exceed 100 characters' });
        }
    }
    if (tags !== undefined) {
        if (!Array.isArray(tags) || tags.length > 10) {
            errors.push({ field: 'tags', message: 'Tags must be an array with max 10 items' });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors,
        });
    }

    next();
};
