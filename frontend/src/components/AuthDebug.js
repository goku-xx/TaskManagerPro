import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Paper, Typography, Box } from '@mui/material';

function AuthDebug() {
  const { user, isAuthenticated, token } = useContext(AuthContext);

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Authentication Debug Info
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Authentication Status:</Typography>
          <Typography>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Typography>
          <Typography>Token Exists: {token ? 'Yes' : 'No'}</Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">User Object:</Typography>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Token (first 50 chars):</Typography>
          <Typography sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {token ? token.substring(0, 50) + '...' : 'No token'}
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">LocalStorage Token:</Typography>
          <Typography sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {localStorage.getItem('token') ? 
              localStorage.getItem('token').substring(0, 50) + '...' : 
              'No token in localStorage'
            }
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default AuthDebug;