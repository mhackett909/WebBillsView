import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setSubmitted(true);
    // Here you would send the form data to your backend or email service
  };

  return (
    <Box sx={{ maxWidth: 500, margin: '40px auto', padding: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Contact Us</Typography>
          {submitted ? (
            <Alert severity="success">Thank you for reaching out! We'll get back to you soon.</Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                required
              />
              <TextField
                label="Message"
                name="message"
                value={form.message}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={4}
                sx={{ mb: 2 }}
                required
              />
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Send Message
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Contact;
