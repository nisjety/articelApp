const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // For ensuring unique titles

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true, // Ensure each title is unique
        trim: true
    },
    category: { // Corrected spelling from 'kategory' to 'category'
        type: String,
        required: true,
        enum: ['Tech', 'Science', 'Health', 'Lifestyle', 'Entertainment']
    },
    summary: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        default: 'private',
        enum: ['public', 'private']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

ArticleSchema.plugin(uniqueValidator, { message: 'Title must be unique.' }); // Apply the uniqueValidator plugin to the schema

module.exports = mongoose.model("Article", ArticleSchema);
