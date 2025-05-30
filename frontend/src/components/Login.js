import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert, Grid, Link } from '@mui/material';

function Login() {
  const { login, isAuthenticated, error, setError } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
      const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirect to Kanban board or dashboard if already authenticated
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear error when component unmounts or form changes
    return () => {
      if (error) {
        setError(null);
      }
    };
  }, [error, setError]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
     if (error) { // Clear error on new input
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        setIsSubmitting(true);
        setError(null); // Clear previous errors
    await login(form.email, form.password);
    // Navigation will be handled by the useEffect hook based on isAuthenticated
        setIsSubmitting(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
