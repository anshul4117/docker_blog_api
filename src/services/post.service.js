const Post = require('../models/post.model');
const ApiError = require('../utils/ApiError');

// Create a new post
exports.createPost = async (data) => {
    const post = await Post.create(data);
    return post;
};

// Get all posts with search & pagination
exports.getAllPosts = async ({ search, page = 1, limit = 10 }) => {
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    // Build query — exclude soft-deleted posts
    const query = { isDeleted: false };

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
        ];
    }

    const [posts, totalDocs] = await Promise.all([
        Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Post.countDocuments(query),
    ]);

    return {
        posts,
        pagination: {
            page,
            limit,
            totalPages: Math.ceil(totalDocs / limit),
            totalDocs,
        },
    };
};

// Get a single post by ID
exports.getPostById = async (id) => {
    const post = await Post.findOne({ _id: id, isDeleted: false });
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }
    return post;
};

// Full update (PUT)
exports.updatePost = async (id, data) => {
    const post = await Post.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { returnDocument: 'after', runValidators: true }
    );
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }
    return post;
};

// Partial update (PATCH)
exports.partialUpdatePost = async (id, data) => {
    const post = await Post.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }
    return post;
};

// Soft delete
exports.deletePost = async (id) => {
    const post = await Post.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
        { returnDocument: 'after' }
    );
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }
    return post;
};
