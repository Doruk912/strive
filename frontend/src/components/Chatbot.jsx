import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    const assistantMessage = { role: 'assistant', content: 'Bu, basit bir yanıt örneğidir.' };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>Akıllı Asistan</Typography>
      <Box sx={{ maxHeight: '200px', overflowY: 'auto', mb: 2 }}>
        {messages.map((msg, index) => (
          <Typography key={index} align={msg.role === 'user' ? 'right' : 'left'}>
            <strong>{msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}:</strong> {msg.content}
          </Typography>
        ))}
      </Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Mesajınızı yazın..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
      />
      <Button variant="contained" color="primary" onClick={handleSend} sx={{ mt: 1 }}>
        Gönder
      </Button>
    </Box>
  );
};

export default Chatbot; 