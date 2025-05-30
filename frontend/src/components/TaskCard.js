import React from "react";
import { Card, CardContent, Typography, CardActions, Button, Chip } from "@mui/material";

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "error";
      case "inprogress":
        return "warning";
      case "done":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {task.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {task.description}
        </Typography>
        <Chip label={task.status.toUpperCase()} color={getStatusColor(task.status)} size="small" />
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onEdit(task)}>
          Edit
        </Button>
        <Button size="small" color="error" onClick={() => onDelete(task._id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default TaskCard;
