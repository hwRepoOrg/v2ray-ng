import { spawn } from 'child_process';
import prompt from 'electron-prompt';

export class Suoder {
  private options = {
    name: 'Electron App',
    cachePassword: true,
    icon: null,
  };
  constructor(options?: { name: string; icon?: string; cachePassword?: boolean }) {
    this.options = { ...this.options, ...options };
  }

  spawn(cmd: string, args: any[]) {
    return new Promise((resolve, reject) => {
      const cp = spawn('sudo', [cmd, ...args]);
      cp.stdout.on('data', () => {
        prompt({
          title: this.options.name,
          label: 'password',
          inputAttrs: { type: 'password', required: true } as any,
          type: 'input',
          icon: this.options.icon,
        }).then((p) => {
          if (!p) {
            cp.kill('SIGTERM');
          } else {
            cp.stdin.write(`${p}\n`);
            resolve(cp);
          }
        });
      });
    });
  }
}
