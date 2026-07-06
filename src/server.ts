import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import energyRouter from './routers/energy.routes';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.set('trust proxy', 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const corsOptions = {
  origin: process.env.FRONT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api', apiLimiter);
app.use('/api/energy', energyRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
