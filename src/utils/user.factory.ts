import { User } from '../models/user';
import { IdUtils } from './id.utils';

export class UserFactory {
  constructor(private readonly idUtils: IdUtils) {}

  public createUser(): User {
    return {
      id: this.idUtils.generateId(),
    };
  }
}
