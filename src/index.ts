import { WebSocketServer } from 'ws';
import { defaultPort } from './constants/default-port';
import { setup } from './setup';

const port = Number(process.env.PORT) || defaultPort;

const webSocketServer = new WebSocketServer({ port });

const { webSocketController } = setup();

webSocketServer.on('connection', (socket) =>
  webSocketController.handleConnect(socket)
);
