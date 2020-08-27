import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonToObject',
})
export class JsonToObjectPipe implements PipeTransform {
  transform(value: unknown, flag: boolean): any {
    if (flag && typeof value === 'string') {
      let res = value;
      try {
        res = JSON.parse(res);
      } catch (e) {}
      return res;
    }
    if (!flag && typeof value !== 'string') {
      let res = value;
      try {
        res = JSON.stringify(res);
      } catch (e) {}
      return res;
    }
    return value;
  }
}
