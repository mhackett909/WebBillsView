import { useState, useEffect, useContext } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, TextField, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, Alert, Chip, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';

const Account = () => {
  const { username, jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editField, setEditField] = useState(null); // 'email', 'password', 'deactivate', 'mfa'
  const [form, setForm] = useState({ email: '', password: '', mfa: '', newPassword: '', confirmPassword: '' });
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [alert, setAlert] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  const handleTokenRefresh = (newAccessToken, newRefreshToken) => {
      setJwt(newAccessToken);
      setRefresh(newRefreshToken);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    if (username && jwt) {
      getUser(username, jwt, refresh, handleTokenRefresh)
        .then(data => {
          if (isMounted) {
            if (data && data.username) {
              setUser(data);
              setForm(f => ({ ...f, email: data.email || '' }));
              setMfaEnabled(data.mfaEnabled); // Keep for legacy, but always use user.mfaEnabled below
            } else {
              setError('Failed to load user data.');
            }
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setError('Failed to load user data.');
            setLoading(false);
          }
        });
    } else {
      setError('Not authenticated.');
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [username, jwt, refresh]);

  // Handlers for dialog open/close
  const openDialog = (field) => { setEditField(field); setAlert(null); };
  const closeDialog = () => { setEditField(null); setForm({ email: user.email, password: '', mfa: '', newPassword: '', confirmPassword: '' }); setAlert(null); };

  // Simulate API call
  const handleSave = () => {
    if (!user) return;
    if (editField === 'email') {
      if (!form.email.includes('@')) {
        setAlert('Please enter a valid email.');
        return;
      }
      if (!form.password) {
        setAlert('Password required.');
        return;
      }
      setUser({ ...user, email: form.email, emailVerified: false });
      setSnackbar({ open: true, message: 'Email updated. Please verify your new email.' });
      closeDialog();
      return;
    }
    if (editField === 'password') {
      if (!form.password || !form.newPassword || !form.confirmPassword) {
        setAlert('All fields required.');
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setAlert('Passwords do not match.');
        return;
      }
      setSnackbar({ open: true, message: 'Password changed successfully.' });
      closeDialog();
      return;
    }
    if (editField === 'mfa') {
      if (!form.password) {
        setAlert('Password required.');
        return;
      }
      const newMfa = !user.mfaEnabled;
      setUser({ ...user, mfaEnabled: newMfa });
      setMfaEnabled(newMfa); // Keep in sync, but UI always uses user.mfaEnabled
      setSnackbar({ open: true, message: `MFA ${newMfa ? 'enabled' : 'disabled'}.` });
      closeDialog();
      return;
    }
    if (editField === 'deactivate') {
      if (!form.password) {
        setAlert('Password required.');
        return;
      }
      setSnackbar({ open: true, message: 'Account deactivated. You will be logged out.' });
      setTimeout(() => {
        closeDialog();
        navigate('/logout');
      }, 1500);
      return;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ maxWidth: 600, margin: '40px auto', padding: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 600, margin: '40px auto', padding: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Account Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}><Typography variant="subtitle2">Username</Typography></Grid>
            <Grid item xs={6}><Typography>{user.username}</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2">Email</Typography></Grid>
            <Grid item xs={6}>
              <Typography sx={{ display: 'inline', mr: 1 }}>{user.email}</Typography>
              {user.emailVerified ? <Chip label="Verified" color="success" size="small" /> : <Chip label="Unverified" color="warning" size="small" />}
              <Button size="small" sx={{ ml: 2 }} onClick={() => openDialog('email')}>Change</Button>
            </Grid>
            <Grid item xs={6}><Typography variant="subtitle2">User Role</Typography></Grid>
            <Grid item xs={6}><Typography>{user.roles}</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2">Account Created</Typography></Grid>
            <Grid item xs={6}><Typography>{user.createdAt}</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2">Last Login</Typography></Grid>
            <Grid item xs={6}><Typography>{user.lastLogin}</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2">Multi-Factor Auth</Typography></Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Switch checked={user.mfaEnabled} onChange={() => openDialog('mfa')} />}
                label={user.mfaEnabled ? 'Enabled' : 'Disabled'}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => openDialog('password')}>Change Password</Button>
            <Button variant="outlined" color="error" onClick={() => openDialog('deactivate')}>Deactivate Account</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Change Email Dialog */}
      <Dialog open={editField === 'email'} onClose={closeDialog}>
        <DialogTitle>Change Email</DialogTitle>
        <DialogContent>
          <TextField
            label="New Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            fullWidth sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            fullWidth
            InputProps={{ endAdornment: <InputAdornment position="end">*</InputAdornment> }}
          />
          {alert && <Alert severity="info" sx={{ mt: 2 }}>{alert}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={editField === 'password'} onClose={closeDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            fullWidth sx={{ mb: 2 }}
          />
          <TextField
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            fullWidth sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            fullWidth
          />
          {alert && <Alert severity="info" sx={{ mt: 2 }}>{alert}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* MFA Dialog */}
      <Dialog open={editField === 'mfa'} onClose={closeDialog}>
        <DialogTitle>{mfaEnabled ? 'Disable' : 'Enable'} Multi-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Enter your password to {mfaEnabled ? 'disable' : 'enable'} MFA.</Typography>
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            fullWidth
          />
          {alert && <Alert severity="info" sx={{ mt: 2 }}>{alert}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{mfaEnabled ? 'Disable' : 'Enable'}</Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Account Dialog */}
      <Dialog open={editField === 'deactivate'} onClose={closeDialog}>
        <DialogTitle>Deactivate Account</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: 'red' }}>Your account will be DELETED if you don't login within 30 days. Enter your password to confirm deactivation.</Typography>
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            fullWidth
          />
          {alert && <Alert severity="info" sx={{ mt: 2 }}>{alert}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="error">Deactivate</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClick={() => setSnackbar({ open: false, message: '' })}
      />
    </Box>
  );
};

export default Account;