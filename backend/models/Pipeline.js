// models/Pipeline.js
// Mongoose schema for a saved pipeline.
//
// Mongoose is an ODM (Object Document Mapper) for MongoDB.
// Think of it like an ORM but for NoSQL — you define a schema
// and Mongoose handles validation, querying, and saving to MongoDB.

const mongoose = require('mongoose');

// A single submission history entry — created every time user clicks Submit
const HistoryEntrySchema = new mongoose.Schema({
    num_nodes: Number,
    num_edges: Number,
    is_dag: Boolean,
    submittedAt: { type: Date, default: Date.now }
});

// Main pipeline schema
const PipelineSchema = new mongoose.Schema({
    // User-given name for the pipeline e.g. "My RAG Pipeline"
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'Untitled Pipeline'
    },

    // ReactFlow nodes array — stored as-is from the frontend
    // Mixed type means Mongoose won't try to validate the internal structure
    nodes: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },

    // ReactFlow edges array — stored as-is from the frontend
    edges: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },

    // Every time this pipeline is submitted, we log the result here
    history: {
        type: [HistoryEntrySchema],
        default: []
    },

    // Timestamps option automatically adds createdAt and updatedAt fields
}, { timestamps: true });

module.exports = mongoose.model('Pipeline', PipelineSchema);