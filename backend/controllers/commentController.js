const Comment = require('../models/Comment');
exports.getCommentsForTask = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.addComment = async (req, res) => {
  try {
    const commentData = {
      ...req.body,
      task: req.params.taskId,
      author: req.user.id // req.user is populated by authMiddleware
    };
    const comment = new Comment(commentData);
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};