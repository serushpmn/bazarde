import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = Number(process.env.PORT || 4000);
const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: '25mb' })); // ads may include data-URL images

app.get('/', (_req, res) => {
  res.json({
    name: 'bazaar-api',
    version: '1.0.0',
    health: '/api/health',
    bootstrap: '/api/bootstrap',
  });
});

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Bazaar API listening on http://localhost:${port}`);
  console.log(`CORS origin: ${origin}`);
});
