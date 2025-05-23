import { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, TextField, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, Alert, Chip, Snackbar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUser, resendVerificationEmail, updateUser } from '../utils/BillsApiUtil';
import { AuthContext } from '../App';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const Account = () => {
  const { username, jwt, refresh, setJwt, setRefresh } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editField, setEditField] = useState(null); // 'email', 'password', 'deactivate', 'mfa'
  const [form, setForm] = useState({ newEmail: '', password: '', mfa: '', newPassword: '', confirmPassword: '' });
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [alert, setAlert] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  const mfaEnabledFF = process.env.REACT_APP_MFA_OPTION_ENABLED === 'true';
  const emailVerificationEnabled = process.env.REACT_APP_EMAIL_VERIFICATION_ENABLED === 'true';

  // Reusable handleTokenRefresh
  const handleTokenRefresh = useCallback((newAccessToken, newRefreshToken) => {
    if (typeof setJwt === 'function') setJwt(newAccessToken);
    if (typeof setRefresh === 'function') setRefresh(newRefreshToken);
  }, [setJwt, setRefresh]);

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
              setForm(f => ({ ...f, newEmail: data.email || '' }));
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
  }, [username, jwt, refresh, handleTokenRefresh]);

  // Handlers for dialog open/close
  const openDialog = (field) => {
    if (field === 'email') {
      setForm(f => ({ ...f, newEmail: '' }));
    }
    setEditField(field);
    setAlert(null);
  };
  const closeDialog = () => {
    setEditField(null);
    setForm({ newEmail: '', password: '', mfa: '', newPassword: '', confirmPassword: '' });
    setAlert(null);
  };

  // Simulate API call
  const handleSave = async () => {
    if (!user) return;
    let apiPayload = null;
    let successMsg = '';
    let failureMsg = '';
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,}$/;
    const emailPattern = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
    if (editField === 'email') {
      if (!form.newEmail || !emailPattern.test(form.newEmail)) {
        setAlert('Please enter a valid email address.');
        return;
      }
      if (!form.password) {
        setAlert('Password required.');
        return;
      }
      // Send newEmail as a separate field, not as email
      apiPayload = { ...user, newEmail: form.newEmail, password: form.password };
      successMsg = 'Email updated.';
      failureMsg = 'Failed to update email.';
    } else if (editField === 'password') {
      if (!form.password || !form.newPassword || !form.confirmPassword) {
        setAlert('All fields required.');
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setAlert('Passwords do not match.');
        return;
      }
      if (!passwordPattern.test(form.newPassword)) {
        setAlert('Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character.');
        return;
      }
      apiPayload = { ...user, password: form.password, newPassword: form.newPassword };
      successMsg = 'Password changed successfully.';
      failureMsg = 'Failed to change password.';
    } else if (editField === 'mfa') {
      if (!form.password) {
        setAlert('Password required.');
        return;
      }
      const newMfa = !user.mfaEnabled;
      apiPayload = { ...user, password: form.password, mfaEnabled: newMfa };
      successMsg = `MFA ${newMfa ? 'enabled' : 'disabled'}.`;
      failureMsg = `Failed to ${newMfa ? 'enable' : 'disable'} MFA.`;
    } else if (editField === 'deactivate') {
      if (!form.password) {
        setAlert('Password required.');
        return;
      }
      apiPayload = { ...user, password: form.password, recycle: true };
      successMsg = 'Account deactivated. You will be logged out.';
      failureMsg = 'Failed to deactivate account.';
    }
    if (apiPayload) {
      try {
        const result = await updateUser(apiPayload, jwt, refresh, handleTokenRefresh);
        if (result && (!result.error)) {
          setUser(result); // update local user state
          setSnackbar({ open: true, message: successMsg });
          closeDialog();
          if (editField === 'deactivate') {
            setTimeout(() => {
              navigate('/logout');
            }, 1500);
          }
        } else {
          setSnackbar({ open: true, message: failureMsg });
        }
      } catch (err) {
        setSnackbar({ open: true, message: failureMsg });
      }
    }
  };

  // Handler for resending verification email
  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(jwt, refresh, handleTokenRefresh);
      setSnackbar({ open: true, message: 'Verification email sent!' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to send verification email.' });
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
            <Grid item xs={6}><Typography sx={{ fontWeight: 'bold', color: 'secondary.main', fontSize: '1.1rem', letterSpacing: 0.5 }}>{user.username?.toUpperCase()}</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2">Email</Typography></Grid>
            <Grid item xs={6}>
              <Typography sx={{ display: 'inline', mr: 1 }}>{user.email?.toLowerCase()}</Typography>
              {emailVerificationEnabled && (
                user.emailVerified ? (
                  <Chip label="Verified" color="success" size="small" />
                ) : (
                  <>
                    <Chip label="Unverified" color="warning" size="small" />
                    <Button size="small" sx={{ ml: 1 }} onClick={handleResendVerification}>
                      Resend Verification Email
                    </Button>
                  </>
                )
              )}
              <Button size="small" sx={{ ml: 1 }} onClick={() => openDialog('email')}>Change</Button>
            </Grid>
            <Grid item xs={6}><Typography variant="subtitle2">User Role</Typography></Grid>
            <Grid item xs={6}><Typography>{user.roles === 'ROLE_ADMIN' ? 'Admin' : user.roles === 'ROLE_USER' ? 'User' : user.roles}</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2">Account Created</Typography></Grid>
            <Grid item xs={6}><Typography>{user.createdAt ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, timeZoneName: 'short' }).format(new Date(user.createdAt + 'Z')) : ''}</Typography></Grid>
            <Grid item xs={6}><Typography variant="subtitle2">Last Login</Typography></Grid>
            <Grid item xs={6}><Typography>{user.lastLogin ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, timeZoneName: 'short' }).format(new Date(user.lastLogin + 'Z')) : ''}</Typography></Grid>
            {/* MFA label and switch, both hidden if feature flag is off */}
            {mfaEnabledFF && (
              <>
                <Grid item xs={6}><Typography variant="subtitle2">Multi-Factor Auth</Typography></Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch checked={user.mfaEnabled} onChange={() => openDialog('mfa')} />}
                    label={user.mfaEnabled ? 'Enabled' : 'Disabled'}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => openDialog('password')}>Change Password</Button>
            <Button variant="outlined" color="error" onClick={() => openDialog('deactivate')}>Deactivate Account</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Change Email Dialog */}
      <Dialog open={editField === 'email'} onClose={closeDialog} PaperProps={{ sx: { minHeight: 220 } }}>
        <DialogTitle>Change Email</DialogTitle>
        <DialogContent>
          <TextField
            label="New Email"
            type="email"
            value={form.newEmail ?? ''}
            onChange={e => setForm(f => ({ ...f, newEmail: e.target.value }))}
            name="newEmail"
            fullWidth sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            fullWidth
            InputProps={{ endAdornment: <InputAdornment position="end">*</InputAdornment> }}
            sx={{ mb: 2 }}
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
      {mfaEnabledFF && (
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
      )}

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