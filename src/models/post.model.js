const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            minlength: [10, 'Content must be at least 10 characters'],
        },
        author: {
            type: String,
            required: [true, 'Author is required'],
            trim: true,
            minlength: [2, 'Author must be at least 2 characters'],
            maxlength: [100, 'Author cannot exceed 100 characters'],
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: (v) => v.length <= 10,
                message: 'Tags cannot exceed 10 items',
            },
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Text index for search
postSchema.index({ title: 'text', content: 'text' });

// Index for sorting by date
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
