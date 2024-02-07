import express, { type Request, type Response } from 'express';
import next from 'next';

const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const roomStoragePath = process.env.ROOM_LOCAL_STORAGE_PATH || './storage';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, hostname, port });
const requestHandler = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('/api/express/health', (req: Request, res: Response) =>
    res.send(`ok`)
  );

  server.use('/static', express.static(roomStoragePath));

  server.all('*', (req: Request, res: Response) => requestHandler(req, res));

  server.listen(port, () =>
    console.log(`> Server listening at http://${hostname}:${port}`)
  );
});
