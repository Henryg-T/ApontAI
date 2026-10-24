"""
gesture_detector.py — compativel com mediapipe 0.10+
"""

import cv2
import socketio
import time
import math
import urllib.request
import os
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python.vision import HandLandmarker, HandLandmarkerOptions, RunningMode

# ── Configuracao ──────────────────────────────
SERVER_URL    = "http://localhost:3000"
CAM_INDEX     = 0
MIN_CONF      = 0.65
COOLDOWN      = 0.6
DRAW_PINCH    = 0.07
MODEL_PATH    = "hand_landmarker.task"
MODEL_URL     = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

if not os.path.exists(MODEL_PATH):
    print("[Modelo] Baixando hand_landmarker.task (~8MB)...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print("[Modelo] Download concluido!")

# ── Socket.io ─────────────────────────────────
sio = socketio.Client(reconnection=True, reconnection_attempts=0)

@sio.event
def connect():
    print("[Socket] Conectado ao servidor Node.js")

@sio.event
def disconnect():
    print("[Socket] Desconectado")

def emit(event, data):
    try:
        if sio.connected:
            sio.emit(event, data)
    except Exception as e:
        print(f"[Erro emit] {e}")

# ── Geometria ─────────────────────────────────
def dist(a, b):
    return math.hypot(a.x - b.x, a.y - b.y)

def fingers_up(lm):
    tips   = [4, 8, 12, 16, 20]
    joints = [3, 6, 10, 14, 18]
    up = [lm[tips[0]].x < lm[joints[0]].x]
    for i in range(1, 5):
        up.append(lm[tips[i]].y < lm[joints[i]].y)
    return up

def classify(lm):
    #if dist(lm[4], lm[8]) < DRAW_PINCH:
       #return 'pinch'
    if dist(lm[4], lm[8]) < DRAW_PINCH:
        return 'pinch'
    up = fingers_up(lm)
    n  = sum(up)
    if n == 5: return 'open'
    if n == 0: return 'point'

    if up[1] and not any(up[2:]): return 'fist'
    if up[1] and up[2] and not up[3] and not up[4]: return 'peace'
    return None

# ── Estado ────────────────────────────────────
last_gesture  = None
last_nav_time = 0.0
draw_active   = False
laser_active  = False
buf           = []
BUF_SIZE      = 4

def process(gesture, lm):
    global last_gesture, last_nav_time, draw_active, laser_active

    tip = lm[8]
    nx  = round(1 - tip.x, 4)
    ny  = round(tip.y, 4)

    if gesture == 'point':
        emit('cursor', {'x': nx, 'y': ny})
        if not laser_active:
            laser_active = True
            emit('gesture', {'type': 'laser_on', 'confidence': 0.9})
        if draw_active:
            draw_active = False
            emit('gesture', {'type': 'draw_off', 'confidence': 0.9})
        return

    if laser_active:
        laser_active = False
        emit('gesture', {'type': 'laser_off', 'confidence': 0.9})

    if gesture == 'pinch':
        if not draw_active:
            draw_active = True
            emit('gesture', {'type': 'draw_on', 'confidence': 0.85})
        emit('draw_point', {'x': nx, 'y': ny, 'active': True})
        return

    if draw_active:
        draw_active = False
        emit('draw_point', {'x': 0, 'y': 0, 'active': False})
        emit('gesture', {'type': 'draw_off', 'confidence': 0.85})

    now = time.time()
    if now - last_nav_time < COOLDOWN:
        return

    if gesture == 'open'  and last_gesture != 'open':
        emit('gesture', {'type': 'next',  'confidence': 0.95})
        last_nav_time = now
    elif gesture == 'fist' and last_gesture != 'fist':
        emit('gesture', {'type': 'prev',  'confidence': 0.95})
        last_nav_time = now
    elif gesture == 'peace' and last_gesture != 'peace':
        emit('gesture', {'type': 'clear', 'confidence': 0.88})
        last_nav_time = now

    last_gesture = gesture

# ── Desenhar landmarks manualmente ────────────
CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),
    (0,5),(5,6),(6,7),(7,8),
    (5,9),(9,10),(10,11),(11,12),
    (9,13),(13,14),(14,15),(15,16),
    (13,17),(17,18),(18,19),(19,20),(0,17)
]

def draw_hand(frame, lm):
    h, w = frame.shape[:2]
    pts = [(int(p.x * w), int(p.y * h)) for p in lm]
    for a, b in CONNECTIONS:
        cv2.line(frame, pts[a], pts[b], (147, 197, 253), 1)
    for x, y in pts:
        cv2.circle(frame, (x, y), 4, (37, 99, 235), -1)

# ── Main ──────────────────────────────────────
def main():
    global buf

    try:
        sio.connect(SERVER_URL, transports=['websocket'])
    except Exception as e:
        print(f"[Erro] Nao conectou: {e}")
        print(f"       O Node.js esta rodando em {SERVER_URL}?")
        return

    options = HandLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=RunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=MIN_CONF,
        min_hand_presence_confidence=MIN_CONF,
        min_tracking_confidence=MIN_CONF,
    )
    detector = HandLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(CAM_INDEX)
    if not cap.isOpened():
        print(f"[Erro] Webcam {CAM_INDEX} nao encontrada.")
        sio.disconnect()
        return

    print("\n[OK] Webcam aberta! Pressione Q para sair.")
    print("Gestos: mao aberta=proximo | punho=anterior | indicador=laser | pinca=desenho | 2 dedos=apagar\n")

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        frame  = cv2.flip(frame, 1)
        rgb    = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = detector.detect(mp_img)

        if result.hand_landmarks:
            lm      = result.hand_landmarks[0]
            gesture = classify(lm)

            buf.append(gesture)
            if len(buf) > BUF_SIZE:
                buf.pop(0)

            if buf.count(gesture) >= BUF_SIZE - 1:
                process(gesture, lm)

            draw_hand(frame, lm)
            cv2.putText(frame, gesture or "?", (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (37, 99, 235), 2)
        else:
            buf.clear()

        cv2.imshow("GestureSlide - Q para sair", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    detector.close()
    sio.disconnect()
    print("\n[Fim] Encerrado.")

if __name__ == '__main__':
    main()