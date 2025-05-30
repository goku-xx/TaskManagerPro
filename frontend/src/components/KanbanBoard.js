import React, { useEffect, useState, useContext, useCallback } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Container, Grid, Paper, Typography, Button, Modal, Box, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const columnsFromBackend = {
  todo: {
    name: 'To Do',
    items: [],
  },
  inprogress: {
    name: 'In Progress',
    items: [],
  },
  done: {
    name: 'Done',
    items: [],
  },
};

function KanbanBoard() {
  const [columns, setColumns] = useState(columnsFromBackend);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext); // For potential user-specific tasks if API supports it

  const [openModal, setOpenModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/tasks'); // Assumes API returns all tasks for the user
      const newColumns = JSON.parse(JSON.stringify(columnsFromBackend)); // Deep copy
      // Initialize items arrays for each column to prevent errors if res.data is empty
      newColumns.todo.items = [];
      newColumns.inprogress.items = [];
      newColumns.done.items = [];

      res.data.forEach(task => {
        if (newColumns[task.status]) {
          newColumns[task.status].items.push(task);
        } else {
          console.warn(`Task with unknown status: ${task.status}`, task);
          newColumns.todo.items.push(task); // Default to 'todo'
        }
      });
      setColumns(newColumns);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError(err.response?.data?.message || "Could not load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
    // API and columnsFromBackend are stable. setLoading, setError, setColumns are stable setters.
  }, [/* No external component-scope dependencies that change over time needed here */]);

  useEffect(() => {
    if (user) { // Only fetch tasks if a user is authenticated
      fetchTasks();
    }
  }, [user, fetchTasks]); // Re-run if user changes or fetchTasks reference changes (it's stable due to useCallback)

  const handleOpenModal = (task = null) => {
    setTaskToEdit(task);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTaskToEdit(null);
  };

  const handleSubmitTask = async (taskData) => {
    setError(null);
    try {
      if (taskData._id) { // Editing existing task
        await API.put(`/tasks/${taskData._id}`, taskData);
      } else { // Adding new task
        await API.post('/tasks', taskData);
      }
      fetchTasks(); // Refresh tasks
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save task:", err);
      setError(err.response?.data?.message || "Could not save task.");
      // Keep modal open on error if desired, or display error in modal
    }
  };

  const handleDeleteTask = async (taskId) => {
    setError(null);
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await API.delete(`/tasks/${taskId}`);
        fetchTasks(); // Refresh tasks
      } catch (err) {
        console.error("Failed to delete task:", err);
        setError(err.response?.data?.message || "Could not delete task.");
      }
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return; // Item dropped in the same place
    }
    
    const taskToMove = columns[source.droppableId].items.find(task => task._id === draggableId);
    if (!taskToMove) return;

    // Optimistic UI Update
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = (source.droppableId === destination.droppableId) ? sourceItems : [...destColumn.items];
    
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });

    // API Call to update task status
    try {
      await API.put(`/tasks/${draggableId}`, { ...taskToMove, status: destination.droppableId });
      // If API call is successful, the optimistic update is fine.
      // Optionally, refetchTasks() for full consistency, but can cause a flicker.
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError(err.response?.data?.message || "Could not update task status. Reverting.");
      // Revert UI on error
      fetchTasks(); // Or more sophisticated revert logic
    }
  };
  
  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Kanban Board
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Add Task
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={3}>
          {Object.entries(columns).map(([columnId, column]) => (
            <Grid item xs={12} md={4} key={columnId}>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: '#e9ecef', minHeight: '70vh' }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                  {column.name} ({column.items.length})
                </Typography>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        background: snapshot.isDraggingOver ? 'lightblue' : 'transparent',
                        padding: '4px',
                        minHeight: '60vh', // Ensure droppable area is large enough
                      }}
                    >
                      {column.items.map((item, index) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                userSelect: 'none',
                                mb: 1,
                                ...provided.draggableProps.style,
                              }}
                            >
                              <TaskCard
                                task={item}
                                onEdit={() => handleOpenModal(item)}
                                onDelete={handleDeleteTask}
                              />
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="task-form-modal-title"
        aria-describedby="task-form-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="task-form-modal-title" variant="h6" component="h2" gutterBottom>
            {taskToEdit ? 'Edit Task' : 'Add New Task'}
          </Typography>
          <TaskForm
            onSubmit={handleSubmitTask}
            taskToEdit={taskToEdit}
            onCancel={handleCloseModal}
          />
        </Box>
      </Modal>
    </Container>
  );
}

export default KanbanBoard;
