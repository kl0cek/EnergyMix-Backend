import express from 'express';
import cors from 'cors';
import energyRouter from './routers/energy.routes';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

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

app.use('/api/energy', energyRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
