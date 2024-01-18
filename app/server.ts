import express, { Request, Response } from 'express';
import next from 'next';

if (!process.env.PORT) {
  process.env.PORT = '3000';
}

if (!process.env.STATIC_PATH) {
  console.log('static is not found');
}

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('/api/express/health', (req: Request, res: Response) => {
    res.send(
      `hello from express server \n static path: ${process.env.STATIC_PATH}`
    );
  });

  server.use('/api/static', express.static(`${process.env.STATIC_PATH}`));

  server.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });
  server.listen(port, () => {
    console.log(`Runing on port ${port}, dev: ${dev}`);
  });
});
