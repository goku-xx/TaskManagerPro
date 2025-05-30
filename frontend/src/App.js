import React, { useContext, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Box,
} from '@mui/material';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Lazy-loaded components
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const KanbanBoard = lazy(() => import('./components/KanbanBoard'));
const Navbar = lazy(() => import('./components/Navbar'));

// Theme customization
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f4f6f8',
    },
  },
});

// Loading fallback component
const FullScreenLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

// Route protection wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <FullScreenLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <FullScreenLoader />;

  return (
    <Router>
      {/* Show Navbar only when authenticated */}
      {isAuthenticated && <Navbar />}

      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <KanbanBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
