import { v4 } from 'uuid';

export class IdUtils {
  public generateId(): string {
    return v4();
  }
}
