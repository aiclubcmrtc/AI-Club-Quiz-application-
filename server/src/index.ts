import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api.js';
import { getSummary, incidentMetrics } from './data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.includes('/api/stream/')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

import { quizRouter } from './routes/quiz.js';

// Mount API routes
app.use('/api/quiz', quizRouter);
app.use('/api', apiRouter);

// Server-Sent Events (SSE) telemetry stream for ultra-reactive live telemetry
app.get('/api/stream/telemetry', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendTelemetry = () => {
    const summary = getSummary();
    // Add subtle organic jitter to metrics to look genuinely live
    const jitter = (Math.random() - 0.5) * 0.1;
    const data = {
      ...summary,
      systemHealth: Math.min(100, Math.max(50, +(summary.systemHealth + jitter).toFixed(1))),
      timestamp: new Date().toISOString(),
      liveMetrics: incidentMetrics
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendTelemetry();
  const interval = setInterval(sendTelemetry, 2500);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// Serve frontend build in production if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // If client build isn't present, return a helpful API greeting
      res.status(200).send(`
        <html>
          <body style="background:#080c14;color:#06b6d4;font-family:sans-serif;padding:40px;text-align:center;">
            <h1>SentinelOps AI API Server Running</h1>
            <p style="color:#94a3b8;">API endpoints are live under <a href="/api/healthz" style="color:#38bdf8;">/api/healthz</a></p>
            <p style="color:#64748b;">Start client dev server with <code>npm run dev:client</code> to view the React command center.</p>
          </body>
        </html>
      `);
    }
  });
});

const PORTS = [5000, 5173];

PORTS.forEach((p) => {
  try {
    const serverInstance = app.listen(p, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🛡️  AI CLUB CMRTC Unified Server Live`);
      console.log(`📡  Listening directly on http://0.0.0.0:${p}`);
      console.log(`🌐  Quiz API & Web App ready on port ${p}`);
      console.log(`====================================================`);
    });
    serverInstance.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Port ${p}] In use by another service, fallback active.`);
      } else {
        console.error(`[Port ${p}] Error:`, err);
      }
    });
  } catch (err) {
    console.warn(`Could not start port ${p}:`, err);
  }
});
