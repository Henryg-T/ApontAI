const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const PORT = 3000;
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Aceita qualquer arquivo de imagem sem filtro rígido
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `slide_${Date.now()}_${Math.floor(Math.random() * 9999)}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Estado da sessão
let session = {
  slides: [],
  current: 0,
  drawMode: false,
  laserMode: false,
};

app.use(express.static('public'));
app.use(express.json());

// Upload — aceita qualquer arquivo
app.post('/upload', upload.array('slides', 100), (req, res) => {
  console.log('[Upload] Arquivos recebidos:', req.files ? req.files.length : 0);

  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });

  const novos = req.files.map(f => `/uploads/${f.filename}`);
  session.slides.push(...novos);
  session.current = 0;

  io.emit('slides_updated', { slides: session.slides, current: session.current });
  res.json({ success: true, slides: session.slides });
});

// Limpar slides
app.delete('/slides', (req, res) => {
  session.slides.forEach(s => {
    const fp = path.join(__dirname, 'public', s);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  });
  session.slides = [];
  session.current = 0;
  io.emit('slides_updated', { slides: [], current: 0 });
  res.json({ success: true });
});

app.get('/state', (req, res) => res.json(session));

// WebSocket
io.on('connection', (socket) => {
  console.log(`[WS] Cliente conectado: ${socket.id}`);
  socket.emit('slides_updated', { slides: session.slides, current: session.current });

  socket.on('gesture', (data) => {
    console.log(`[Gesto] ${data.type}`);
    handleGesture(data.type);
    io.emit('gesture', data);
  });

  socket.on('cursor', (data) => io.emit('cursor', data));
  socket.on('draw_point', (data) => io.emit('draw_point', data));

  socket.on('disconnect', () => {
    console.log(`[WS] Desconectado: ${socket.id}`);
  });
});

function handleGesture(type) {
  switch (type) {
    case 'next':
      if (session.current < session.slides.length - 1) {
        session.current++;
        io.emit('slide_change', { current: session.current });
      }
      break;
    case 'prev':
      if (session.current > 0) {
        session.current--;
        io.emit('slide_change', { current: session.current });
      }
      break;
    case 'draw_on':  session.drawMode  = true;  io.emit('mode_change', { drawMode: true });   break;
    case 'draw_off': session.drawMode  = false; io.emit('mode_change', { drawMode: false });  break;
    case 'laser_on': session.laserMode = true;  io.emit('mode_change', { laserMode: true });  break;
    case 'laser_off':session.laserMode = false; io.emit('mode_change', { laserMode: false }); break;
    case 'clear':    io.emit('clear_canvas'); break;
  }
}

http.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 GestureSlide rodando em http://localhost:${PORT}\n`);
});