import { Injectable } from '@angular/core';
import { ISubscribe } from '@typing/subscribe.interface';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  subscribeList: ISubscribe[] = [];

  constructor() {}
}
