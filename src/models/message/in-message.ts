import { Direction } from '../direction';

export const InMessageTypes = {
  CreateGame: 'CREATE_GAME',
  JoinGame: 'JOIN_GAME',
  DeleteGame: 'DELETE_GAME',
  StartMoveTank: 'START_MOVE_TANK',
  StopMoveTank: 'STOP_MOVE_TANK',
  Shoot: 'SHOOT',
} as const;

interface CreateGameInMessage {
  type: typeof InMessageTypes.CreateGame;
}

interface JoinGameInMessage {
  type: typeof InMessageTypes.JoinGame;
  gameId: string;
}

interface DeleteGameInMessage {
  type: typeof InMessageTypes.DeleteGame;
}

interface StartMoveTankInMessage {
  type: typeof InMessageTypes.StartMoveTank;
  gameId: string;
  userId: string;
  direction: Direction;
}

interface StopMoveTankInMessage {
  type: typeof InMessageTypes.StopMoveTank;
  gameId: string;
  userId: string;
}

interface ShootInMessage {
  type: typeof InMessageTypes.Shoot;
  gameId: string;
  userId: string;
}

export type InMessage =
  | CreateGameInMessage
  | JoinGameInMessage
  | DeleteGameInMessage
  | StartMoveTankInMessage
  | StopMoveTankInMessage
  | ShootInMessage;
