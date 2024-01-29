import express, { Request, Response } from 'express';
import next from 'next';

if (!process.env.PORT) {
  throw new Error('failed to start server : PORT is not set');
}

if (!process.env.ROOM_PERSISTANT_VOLUME_PATH) {
  throw new Error('ROOM_PERSISTANT_VOLUME_PATH is not set');
}

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('/api/express/health', (req: Request, res: Response) => {
    res.send(`hello from express server`);
  });

  server.use(
    '/static',
    express.static(`${process.env.ROOM_PERSISTANT_VOLUME_PATH}`)
  );

  server.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });
  server.listen(port, () => {
    console.log(`Runing on port ${port}, dev: ${dev}`);
  });
});
