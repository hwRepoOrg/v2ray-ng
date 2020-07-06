import { EventEmitter } from 'events';

export class AppConfig extends EventEmitter {
  private homePath = process.env.HOME;
}
