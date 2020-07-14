import { STColumn } from '@delon/abc/st';

// @ts-ignore
export interface ISTColumn<T = any> extends STColumn {
  index: keyof T | string | string[];
}
