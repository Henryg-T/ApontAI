const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = 3000;

// Servir frontend
app.use(express.static('public'));

// Conexão WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('gesture', (data) => {
    console.log('Gesto recebido:', data);

    // Enviar para todos conectados
    io.emit('gesture', data);
  });
});

// Iniciar servidor
http.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});