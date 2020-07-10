import { SFSchema, SFUISchemaItem } from '@delon/form';

// @ts-ignore
export interface ISFSchema<T = any> extends SFSchema {
  required?: Array<keyof T>;
  ui?: ISFUISchemaItem<T>;
  properties?: {
    [K in keyof T]?: ISFSchema<T[K]>;
  } & { [key: string]: SFSchema };
}

// @ts-ignore
export interface ISFUISchemaItem<T = any> extends SFUISchemaItem {
  order?: Array<keyof T | '*'>;
}
