import React, { useEffect, useState, useContext, useCallback } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Container, Grid, Paper, Typography, Button, Modal,
  Box, CircularProgress, Alert
} from '@mui/material';
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
  todo: { name: 'To Do', items: [] },
  inprogress: { name: 'In Progress', items: [] },
  done: { name: 'Done', items: [] },
};

function KanbanBoard() {
  const [columns, setColumns] = useState(columnsFromBackend);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const { user, isAuthenticated } = useContext(AuthContext);

  // Debug: Log user object to see its structure
  useEffect(() => {
    console.log('User object:', user);
    console.log('Is authenticated:', isAuthenticated);
    console.log('Token exists:', !!localStorage.getItem('token'));
  }, [user, isAuthenticated]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/tasks');
      const newColumns = { ...columnsFromBackend };
      res.data.forEach(task => {
        const col = newColumns[task.status] || newColumns['todo'];
        col.items.push(task);
      });
      setColumns(newColumns);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchTasks();
    }
  }, [user, isAuthenticated, fetchTasks]);

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
    
    console.log('handleSubmitTask called with:', taskData);
    console.log('Current user:', user);
    console.log('Is authenticated:', isAuthenticated);
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setError("User not authenticated. Please log in.");
      return;
    }

    try {
      if (taskData._id) {
        // Update existing task
        const updatedPayload = {
          ...taskToEdit,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
        };
        const { _id, ...data } = updatedPayload;
        console.log('Updating task:', _id, 'with data:', data);
        await API.put(`/tasks/${_id}`, data);
      } else {
        // Create new task
        const userId = user.id;
        console.log('User ID for new task:', userId);
        
        if (!userId) {
          console.error('User ID not found in user object:', user);
          setError("Project ID is required to create a task. User ID not found.");
          return;
        }

        const newTask = {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'todo',
          projectId: userId, // Using user.id from AuthContext
        };
        
        console.log('Creating task with data:', newTask);
        const response = await API.post('/tasks', newTask);
        console.log('Task creation response:', response.data);
      }
      
      fetchTasks();
      handleCloseModal();
    } catch (err) {
      console.error('Task submission error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || "Could not save task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete task.");
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    const taskToMove = columns[source.droppableId].items.find(task => task._id === draggableId);
    if (!taskToMove) return;

    const sourceItems = [...columns[source.droppableId].items];
    const destItems = source.droppableId === destination.droppableId
      ? sourceItems
      : [...columns[destination.droppableId].items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: { ...columns[source.droppableId], items: sourceItems },
      [destination.droppableId]: { ...columns[destination.droppableId], items: destItems },
    });

    try {
      await API.put(`/tasks/${draggableId}`, { ...taskToMove, status: destination.droppableId });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task. Reverting.");
      fetchTasks(); // Rollback on failure
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          Please log in to access the Kanban board.
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Kanban Board</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Add Task
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={3}>
          {Object.entries(columns).map(([columnId, column]) => (
            <Grid item xs={12} md={4} key={columnId}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: '70vh' }}>
                <Typography variant="h6" align="center" gutterBottom>
                  {column.name} ({column.items.length})
                </Typography>
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        backgroundColor: snapshot.isDraggingOver ? '#dfefff' : 'transparent',
                        p: 1,
                        minHeight: '60vh',
                        borderRadius: 1,
                      }}
                    >
                      {column.items.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ mb: 2, ...provided.draggableProps.style }}
                            >
                              <TaskCard
                                task={task}
                                onEdit={() => handleOpenModal(task)}
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

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
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