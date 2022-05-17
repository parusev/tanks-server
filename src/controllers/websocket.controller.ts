import WebSocket from 'ws';
import { InMessage } from '../models/message/in-message';
import { OutMessage, OutMessageTypes } from '../models/message/out-message';
import { User } from '../models/user';
import { UserFactory } from '../utils/user.factory';

export class WebSocketController {
  private socketsByUserId: Map<string, WebSocket> = new Map();

  public getOnConnectMessage?: () => OutMessage;

  public onMessage?: (message: InMessage, user: User) => void;

  public onDisconnect?: (userId: string) => void;

  constructor(private readonly userFactory: UserFactory) {}

  public handleConnect(socket: WebSocket): void {
    const user = this.userFactory.createUser();
    const { id: userId } = user;

    this.socketsByUserId.set(userId, socket);

    socket.on('message', (stringMessage: string) => {
      try {
        const message = JSON.parse(stringMessage);

        this.onMessage?.(message, user);
      } catch (e) {
        console.error('Error', e);

        socket.send(
          JSON.stringify({
            type: OutMessageTypes.Error,
            message: 'Something went wrong',
          })
        );
      }
    });

    socket.on('close', () => this.handleDisconnect(userId));

    if (this.getOnConnectMessage) {
      socket.send(JSON.stringify(this.getOnConnectMessage()));
    }
  }

  public handleDisconnect(userId: string): void {
    this.socketsByUserId.get(userId).removeAllListeners();
    this.socketsByUserId.delete(userId);
    this.onDisconnect?.(userId);
  }

  public sendMessageToAllSockets(message: OutMessage): void {
    const stringMessage = JSON.stringify(message);

    this.socketsByUserId.forEach((socket) => {
      socket.send(stringMessage);
    });
  }

  public sendMessageToUser(userId: string, message: OutMessage): void {
    const socket = this.socketsByUserId.get(userId);

    if (socket === undefined) {
      this.onDisconnect?.(userId);

      return;
    }

    socket.send(JSON.stringify(message));
  }
}
