import React, { useState, useEffect } from "react";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material";

const TaskForm = ({ onSubmit, taskToEdit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setStatus(taskToEdit.status);
    }
  }, [taskToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, status, _id: taskToEdit?._id });
    setTitle("");
    setDescription("");
    setStatus("todo");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="title"
        label="Title"
        name="title"
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="description"
        label="Description"
        id="description"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="status-select-label">Status</InputLabel>
        <Select
          labelId="status-select-label"
          id="status-select"
          value={status}
          label="Status"
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="todo">To Do</MenuItem>
          <MenuItem value="inprogress">In Progress</MenuItem>
          <MenuItem value="done">Done</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        {taskToEdit && (
          <Button onClick={onCancel} sx={{ mr: 1 }}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained">
          {taskToEdit ? "Update Task" : "Add Task"}
        </Button>
      </Box>
    </Box>
  );
};

export default TaskForm;
