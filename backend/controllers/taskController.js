const Task = require('../models/Task');
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, project } = req.body;
    if (!project) {
      return res.status(400).json({ message: 'Project ID is required to create a task.' });
    }
    // Add createdBy if you add it to the Task model: createdBy: req.user.id
    const taskData = { title, description, status, assignedTo, project /*, createdBy: req.user.id */ };
    const task = new Task(taskData);
    // Populate project details if needed for the socket event, or send the full task
    // await task.populate('project assignedTo'); // Example if you need populated data
    await task.save();
    const io = req.app.get('socketio');
    io.to(task.project.toString()).emit('newTask', task); // Emit to a room named after the project ID
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};