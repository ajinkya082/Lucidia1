import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/auth.ts';
import userRoutes from './routes/users.ts';
import faceRoutes from './routes/faces.ts';
import memoryRoutes from './routes/memories.ts';
import reminderRoutes from './routes/reminders.ts';
import alertRoutes from './routes/alerts.ts';
import gpsRoutes from './routes/gps.ts';
import safeZoneRoutes from './routes/safeZones.ts';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function startFaceAPI() {
  const apiPath = path.join(__dirname, '..', 'Module', 'api.py');
  const python  = process.platform === 'win32' ? 'py' : 'python3';
  const args    = process.platform === 'win32' ? ['-3.11', apiPath] : [apiPath];

  const proc = spawn(python, args, {
    cwd: path.join(__dirname, '..', 'Module'),
    stdio: 'pipe',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
  });

  proc.stdout.on('data', (d) => console.log('[FaceAPI]', d.toString().trim()));
  proc.stderr.on('data', (d) => console.error('[FaceAPI]', d.toString().trim()));

  proc.on('exit', (code) => {
    if (code !== 0) {
      console.warn(`[FaceAPI] exited with code ${code}. Restarting in 5s...`);
      setTimeout(startFaceAPI, 5000);
    }
  });

  // Kill Python process when Node exits
  process.on('exit', () => proc.kill());
  process.on('SIGINT', () => { proc.kill(); process.exit(); });
  process.on('SIGTERM', () => { proc.kill(); process.exit(); });

  console.log('[FaceAPI] Starting face recognition module...');
}

async function startServer() {
  // Auto-start Python face recognition module
  startFaceAPI();

  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.use(cors({
    origin: ALLOWED_ORIGIN,
    credentials: true
  }));

  // =============================
  // SOCKET.IO
  // =============================
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (room) => {
      socket.join(room);
    });

    socket.on('locationUpdate', (data) => {
      io.to(data.patientId).emit('locationUpdate', data);
    });

    socket.on('newAlert', (data) => {
      io.to(data.patientId).emit('newAlert', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // =============================
  // ROUTES
  // =============================
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/faces', faceRoutes);
  app.use('/api/memories', memoryRoutes);
  app.use('/api/reminders', reminderRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/gps', gpsRoutes);
  app.use('/api/safe-zones', safeZoneRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Global error handler must be AFTER all routes
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("GLOBAL ERROR:", err.message);

    if (err.type === 'entity.too.large') {
      return res.status(413).json({ message: "Payload too large. Please upload a smaller file." });
    }

    res.status(500).json({ message: err.message || "Internal server error" });
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();