import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { defaultPort } from './constants/default-port';
import { setup } from './setup';

const port = Number(process.env.PORT) || defaultPort;

const app = express();

app.use(express.static(path.join(__dirname, '/../..client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/../../client/dist/index.html'));
});

const server = createServer(app);

const webSocketServer = new WebSocketServer({ server, path: '/ws' });

const { webSocketController } = setup();

webSocketServer.on('connection', (socket) =>
  webSocketController.handleConnect(socket)
);

server.listen(port, () => console.log(`Running on port ${port}`));
