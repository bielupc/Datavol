import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { migrate, waitForDb } from './db.js';
import { loadDataset } from './dataset/loader.js';
import { registerRoutes } from './routes.js';
import { seed } from './seed.js';

const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });

await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024 } });
await registerRoutes(app);

await waitForDb();
await migrate();
loadDataset();
await seed();

const port = parseInt(process.env.PORT ?? '3001', 10);
await app.listen({ port, host: '0.0.0.0' });
app.log.info(`API a punt al port ${port}`);
