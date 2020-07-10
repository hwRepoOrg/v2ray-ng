import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonToObject',
})
export class JsonToObjectPipe implements PipeTransform {
  transform(value: unknown, flag: boolean): any {
    if (flag && typeof value === 'string') {
      return JSON.parse(value);
    }
    if (!flag && typeof value !== 'string') {
      return JSON.stringify(value);
    }
    return value;
  }
}
