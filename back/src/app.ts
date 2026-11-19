import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { env } from './config/env';

export const createApp = (): Express => {
  const app = express();

  // Segurança HTTP com Helmet
  app.use(helmet());

  // CORS configurado para o frontend PalcoLivre
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Parse de corpo JSON e URL Encoded
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rota de Health Check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      platform: 'PalcoLivre API',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Rotas da API
  app.use('/api', routes);

  // Middleware Global de Tratamento de Erros
  app.use(errorHandler);

  return app;
};
