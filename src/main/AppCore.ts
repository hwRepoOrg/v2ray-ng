import node7zBin from '7zip-bin';
import { ChildProcessWithoutNullStreams, execFile, spawn } from 'child_process';
import { app } from 'electron';
import { chmod, constants, createWriteStream, existsSync, mkdirSync, moveSync, pathExists, removeSync } from 'fs-extra';
import node7z from 'node-7z';
import * as Path from 'path';
import request from 'request';
import progress from 'request-progress';
import { Subject } from 'rxjs';

export class AppCore {
  public corePath: string;
  public mellowCorePath: string;
  public v2rayCorePath: string;
  public v2rayCore: ChildProcessWithoutNullStreams;
  public mellowCore: ChildProcessWithoutNullStreams;

  constructor() {
    this.corePath = Path.resolve(app.getPath('appData'), 'v2ray-ng');

    if (!existsSync(this.corePath)) {
      mkdirSync(this.corePath);
    }

    this.mellowCorePath = Path.resolve(this.corePath, './mellow_core');
    this.v2rayCorePath = Path.resolve(this.corePath, './v2ray_core');
  }

  async getMellowCoreVersion(): Promise<string | null> {
    const isExists = await pathExists(this.mellowCorePath);
    if (!isExists) {
      return null;
    }
    await chmod(this.mellowCorePath, constants.S_IXUSR);
    return await this.execute(`${this.mellowCorePath}`, ['-version']);
  }

  async getV2rayCoreVersion(): Promise<string | null> {
    const isExists = await pathExists(this.v2rayCorePath);
    if (!isExists) {
      return null;
    }
    await chmod(this.v2rayCorePath, constants.S_IXUSR);
    return await this.execute(`${this.v2rayCorePath}`, ['-version']);
  }

  execute(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(command, args, (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  updateMellowCore() {
    let url = `https://github.com/mellow-io/go-tun2socks/releases/latest/download/`;
    switch (process.platform) {
      case 'darwin':
        url = `${url}core-darwin-10.6-amd64`;
        break;
      case 'win32':
        url = `${url}core-windows-4.0-amd64.exe`;
        break;
      case 'linux':
        url = `${url}core-linux-amd64`;
        break;
    }
    const tempPath = Path.resolve(app.getPath('temp'), './mellow-core');
    removeSync(tempPath);
    this.progressDownload(url, tempPath).subscribe((state) => {
      if (state instanceof Error) {
        console.log(state);
        global.appInstance.mainWindow.webContents.send('mellow-core-update-progress', state.message);
      } else if (typeof state === 'number') {
        global.appInstance.mainWindow.webContents.send('mellow-core-update-progress', state);
      } else if (state === null) {
        moveSync(tempPath, this.mellowCorePath, { overwrite: true });
        global.appInstance.mainWindow.webContents.send('mellow-core-update-progress', null);
      }
    });
  }

  updateV2rayCore() {
    let url = `https://github.com/v2ray/v2ray-core/releases/latest/download/`;
    switch (process.platform) {
      case 'darwin':
        url = `${url}v2ray-macos-64.zip`;
        break;
      case 'win32':
        url = `${url}v2ray-windows-64.zip`;
        break;
      case 'linux':
        url = `${url}v2ray-linux-64.zip`;
        break;
    }
    const tempPath = Path.resolve(app.getPath('temp'), './v2ray-core.zip');
    const folderPath = tempPath.replace(/\.zip$/, '');
    removeSync(tempPath);
    removeSync(folderPath);
    this.progressDownload(url, tempPath).subscribe((state) => {
      if (state instanceof Error) {
        console.log(state);
        global.appInstance.mainWindow.webContents.send('v2ray-core-update-progress', state.message);
      } else if (typeof state === 'number') {
        global.appInstance.mainWindow.webContents.send('v2ray-core-update-progress', state / 2);
      } else if (state === null) {
        const zipProgress = node7z.extract(tempPath, folderPath, {
          $bin: node7zBin.path7za,
          $progress: true,
        });
        zipProgress.on('progress', (p: any) => {
          global.appInstance.mainWindow.webContents.send('v2ray-core-update-progress', p.percent / 2 / 100 + 0.5);
        });
        zipProgress.on('end', () => {
          moveSync(Path.resolve(folderPath, './v2ray'), Path.resolve(this.v2rayCorePath), { overwrite: true });
          moveSync(Path.resolve(folderPath, './v2ctl'), Path.resolve(this.corePath, './v2ctl'), { overwrite: true });
          moveSync(Path.resolve(folderPath, './geosite.dat'), Path.resolve(this.corePath, './geosite.dat'), {
            overwrite: true,
          });
          moveSync(Path.resolve(folderPath, './geoip.dat'), Path.resolve(this.corePath, './geoip.dat'), {
            overwrite: true,
          });
          global.appInstance.mainWindow.webContents.send('v2ray-core-update-progress', null);
        });
        zipProgress.on('error', (err: Error) => {
          global.appInstance.mainWindow.webContents.send('v2ray-core-update-progress', err.message);
        });
      }
    });
  }

  progressDownload(url: string, path: string) {
    const subject = new Subject<number | Error | null>();
    progress(request(url, { method: 'get' }))
      .on('progress', (state: any) => {
        if (state) {
          subject.next(state.percent);
        }
      })
      .on('error', (err: Error) => {
        subject.next(err);
      })
      .on('end', () => {
        subject.next(null);
      })
      .pipe(createWriteStream(path, { flags: 'w' }));
    return subject;
  }

  startV2rayCore() {
    if (!this.v2rayCore) {
      this.v2rayCore = spawn(this.v2rayCorePath, ['-c', global.appInstance.config.runningConfigPath], {
        env: process.env,
      });
      this.v2rayCore.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      this.v2rayCore.stderr.on('data', (data) => {
        console.log(data.toString());
      });
      this.v2rayCore.on('close', (code, signal) => {
        console.log(`v2ray core stopped, code ${code} signal ${signal}`);
        this.v2rayCore.removeAllListeners();
      });
      this.v2rayCore.on('err', (err) => {
        console.log(err);
        this.v2rayCore.removeAllListeners();
      });
    }
  }

  stopV2rayCore() {
    if (this.v2rayCore) {
      if (process.platform === 'win32') {
      } else {
        this.v2rayCore.kill('SIGTERM');
        this.v2rayCore = null;
      }
    }
  }
}
