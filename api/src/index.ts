import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { migrate, waitForDb } from './db.js';
import { loadDataset } from './dataset/loader.js';
import { rematchUnassigned } from './importer.js';
import { registerRoutes } from './routes.js';
import { seed } from './seed.js';

// trustProxy: l'API mai és accessible directament (només escolta a la xarxa
// interna de Docker), sempre hi arribem via Caddy → nginx. Sense això
// req.ip seria la IP del contenidor web i req.protocol sempre "http".
const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
  trustProxy: true,
});

await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024 } });
await registerRoutes(app);

await waitForDb();
await migrate();
loadDataset();
await seed();
// Després de la llavor: recupera els exercicis que es van crear sense catàleg.
await rematchUnassigned();

const port = parseInt(process.env.PORT ?? '3001', 10);
await app.listen({ port, host: '0.0.0.0' });
app.log.info(`API a punt al port ${port}`);
