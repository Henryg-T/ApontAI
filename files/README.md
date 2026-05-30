# GestureSlide 🖐️

Controle seus slides com gestos da mão via webcam.

## Estrutura

```
gestureslide/
├── server.js              ← Servidor Node.js (Express + Socket.io)
├── gesture_detector.py    ← Detector de gestos (Python + MediaPipe)
├── package.json
└── public/
    └── index.html         ← Frontend (tema azul claro)
```

## Instalação

### Node.js
```bash
npm install
```

### Python
```bash
pip install mediapipe opencv-python "python-socketio[client]" aiohttp
```

## Rodando

**1. Inicie o servidor Node.js:**
```bash
npm start
```
Acesse: http://localhost:3000

**2. Inicie o detector Python (em outro terminal):**
```bash
python gesture_detector.py
```

Uma janela da webcam abrirá com os landmarks da mão desenhados.

## Gestos suportados

| Gesto | Ação |
|-------|------|
| ✋ Mão aberta | Próximo slide |
| ✊ Punho fechado | Slide anterior |
| ☝️ Dedo indicador | Ponteiro laser |
| 🤏 Polegar + indicador (pinça) | Desenhar |
| ✌️ Dois dedos | Apagar canvas |

## Upload de slides

- No frontend, clique em **"+ Adicionar slides"** na barra lateral
- Suporta **PNG, JPG e WebP**
- Para PDF/PPTX: converta as páginas em imagens antes (ex: LibreOffice, pdf2image)

## Variáveis configuráveis (gesture_detector.py)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `SERVER_URL` | `http://localhost:3000` | URL do servidor |
| `CAM_INDEX` | `0` | Índice da webcam |
| `MIN_CONF` | `0.75` | Confiança mínima MediaPipe |
| `COOLDOWN` | `0.6` | Segundos entre comandos de nav |
| `DRAW_PINCH` | `0.06` | Sensibilidade da pinça |
