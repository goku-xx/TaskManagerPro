const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  content: String,
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Comment', commentSchema);