import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Snackbar } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function Authentication() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [formState, setFormState] = React.useState(0); // 0 for login, 1 for signup
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
        console.log(result);
      } else {
        let result = await handleRegister(name, username, password);
        console.log(result);
        setUsername('');
        setMessage(result);
        setOpen(true);
        setError('');
        setFormState(0);
        setPassword('');
      }
    } catch (err) {
      console.log(err);
      let message = err?.response?.data?.message || 'An error occurred';
      setError(message);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          backgroundImage: 'url("/final.png")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 6,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: '90%', sm: '400px' },
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ color: '#fff' }}>
            {formState === 0 ? 'Sign In' : 'Sign Up'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant={formState === 0 ? 'contained' : 'outlined'} onClick={() => setFormState(0)}>
              Sign In
            </Button>
            <Button variant={formState === 1 ? 'contained' : 'outlined'} onClick={() => setFormState(1)}>
              Sign Up
            </Button>
          </Box>

          <Box component="form" noValidate sx={{ mt: 3 }}>
            {formState === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="fullname"
                label="Full Name"
                name="fullname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputLabelProps={{ style: { color: '#fff' } }}
                InputProps={{ style: { color: '#fff' } }}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{ style: { color: '#fff' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{ style: { color: '#fff' } }}
            />

            {error && <Typography sx={{ color: 'red', mt: 1 }}>{error}</Typography>}

            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#9333ea',
                '&:hover': {
                  backgroundColor: '#7e22ce',
                  boxShadow: '0 0 15px #9333ea',
                },
              }}
              onClick={handleAuth}
            >
              {formState === 0 ? 'Login' : 'Register'}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={open} autoHideDuration={4000} message={message} />
    </ThemeProvider>
  );
}
