/// <reference types="node" />

declare type IApplication = import('../main/Application').Application;

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production';
  }
  interface Global {
    appInstance: IApplication;
    serverPort: number;
  }
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare interface IEnvironment {
  production: boolean;
  entryFolder: string;
  github_token: string;
}
