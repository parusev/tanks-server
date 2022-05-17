import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { Action } from './actions/action';
import { defaultGameConfig } from './constants/default-game-config';
import { defaultPort } from './constants/default-port';
import { GameController } from './controllers/game.controller';
import { MessageController } from './controllers/message.controller';
import { WebSocketController } from './controllers/websocket.controller';
import { GameConfig } from './models/game-config';
import { State } from './state/models/state';
import { reducer } from './state/reducer';
import { createStore } from './store/create-store';
import { Store } from './store/models/store';
import { FieldUtils } from './utils/field.utils';
import { GameConverter } from './utils/game.converter';
import { IdUtils } from './utils/id.utils';
import { LevelConfigUtils } from './utils/level-config/level-config.utils';
import { UserFactory } from './utils/user.factory';

const port = Number(process.env.PORT) || defaultPort;

const app = express();

app.use(express.static(path.join(__dirname, '/../..client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/../../client/dist/index.html'));
});

const server = createServer(app);

const webSocketServer = new WebSocketServer({ server, path: '/ws' });

function setup(params?: {
  fieldUtils?: FieldUtils;
  gameConfig?: GameConfig;
  gameController?: GameController;
  gameConverter?: GameConverter;
  idUtils?: IdUtils;
  levelConfigUtils?: LevelConfigUtils;
  messageController?: MessageController;
  store?: Store<State, Action>;
  userFactory?: UserFactory;
  webSocketController?: WebSocketController;
}) {
  const gameConfig = params?.gameConfig ?? defaultGameConfig;

  const fieldUtils = params?.fieldUtils ?? new FieldUtils();

  const gameConverter = params?.gameConverter ?? new GameConverter(fieldUtils);

  const idUtils = params?.idUtils ?? new IdUtils();

  const initialState = {
    gameConfig,
    games: new Map(),
    gameIdByUserId: new Map(),
  };

  const store =
    params?.store ?? createStore<State, Action>(reducer, initialState);

  const levelConfigUtils =
    params?.levelConfigUtils ?? new LevelConfigUtils(fieldUtils, store);

  const gameController =
    params?.gameController ??
    new GameController(
      fieldUtils,
      gameConverter,
      idUtils,
      levelConfigUtils,
      store
    );

  const userFactory = params?.userFactory ?? new UserFactory(idUtils);

  const webSocketController =
    params?.webSocketController || new WebSocketController(userFactory);

  const messageController =
    params?.messageController ||
    new MessageController(
      gameConfig,
      gameController,
      gameConverter,
      store,
      webSocketController
    );

  messageController.startListening();

  return {
    webSocketController,
  };
}

const { webSocketController } = setup();

webSocketServer.on('connection', (socket) =>
  webSocketController.handleConnect(socket)
);

server.listen(port, () => console.log(`Running on port ${port}`));
