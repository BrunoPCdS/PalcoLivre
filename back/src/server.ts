import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`
🎸 =========================================================
   PALCOLIVRE API - A voz da música independente
   Servidor rodando em: http://localhost:${env.PORT}
   Ambiente: ${env.NODE_ENV}
   Documentação & Rotas em: http://localhost:${env.PORT}/api
   Health Check: http://localhost:${env.PORT}/health
=========================================================
  `);
});
