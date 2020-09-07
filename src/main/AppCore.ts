import { ChildProcessWithoutNullStreams, execFile, spawn } from 'child_process';
import { app } from 'electron';
import {
  chmod,
  constants,
  createWriteStream,
  existsSync,
  mkdirSync,
  moveSync,
  pathExists,
  pathExistsSync,
  removeSync,
  stat,
} from 'fs-extra';
import node7z from 'node-7z';
import * as Path from 'path';
import request from 'request';
import progress from 'request-progress';
import { Subject } from 'rxjs';

function execute(command: string, args: string[]): Promise<string> {
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

export class AppCore {
  private corePath = Path.resolve(app.getPath('appData'), 'v2ray-ng');
  private mellowCorePath = Path.resolve(this.corePath, './mellow_core');
  private v2rayCorePath = Path.resolve(this.corePath, './v2ray_core');
  private dlcPath = Path.resolve(this.corePath, './dlc.dat');
  private progressReq: request.Request;
  public v2rayCore: ChildProcessWithoutNullStreams;
  public mellowCore: ChildProcessWithoutNullStreams;

  constructor() {
    if (!existsSync(this.corePath)) {
      mkdirSync(this.corePath);
    }
    global.appInstance.config
      .getGuiConfig(['enabled'])
      .then(({ enabled }) => enabled && pathExists(global.appInstance.config.runningConfigPath))
      .then((flag) => {
        if (flag) {
          this.start();
        }
      });
  }

  async getMellowCoreVersion(): Promise<string | null> {
    const isExists = await pathExists(this.mellowCorePath);
    if (!isExists) {
      return null;
    }
    await chmod(this.mellowCorePath, constants.S_IXUSR);
    return await execute(`${this.mellowCorePath}`, ['-version']);
  }

  async getV2rayCoreVersion(): Promise<string | null> {
    const isExists = await pathExists(this.v2rayCorePath);
    if (!isExists) {
      return null;
    }
    await chmod(this.v2rayCorePath, constants.S_IXUSR);
    return await execute(`${this.v2rayCorePath}`, ['-version']);
  }

  async getDLCUpdatedTime() {
    const isExists = await pathExists(this.dlcPath);
    if (!isExists) {
      return null;
    }
    const info = await stat(this.dlcPath);
    return +info.mtime;
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
        global.appInstance.mainWindow.webContents.send('update-progress', state.message);
      } else if (typeof state === 'number') {
        global.appInstance.mainWindow.webContents.send('update-progress', state);
      } else if (state === null) {
        moveSync(tempPath, this.mellowCorePath, { overwrite: true });
        global.appInstance.mainWindow.webContents.send('update-progress', null);
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
        global.appInstance.mainWindow.webContents.send('update-progress', state.message);
      } else if (typeof state === 'number') {
        global.appInstance.mainWindow.webContents.send('update-progress', state / 2);
      } else if (state === null) {
        const p7zPath = getPath();
        chmod(p7zPath, constants.S_IXUSR).then(() => {
          const zipProgress = node7z.extract(tempPath, folderPath, {
            $bin: p7zPath,
            $progress: true,
          });
          zipProgress.on('progress', (p: any) => {
            global.appInstance.mainWindow.webContents.send('update-progress', p.percent / 2 / 100 + 0.5);
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
            global.appInstance.mainWindow.webContents.send('update-progress', null);
          });
          zipProgress.on('error', (err: Error) => {
            global.appInstance.mainWindow.webContents.send('update-progress', err.message);
          });
        });
      }
    });
  }

  updateDLCData() {
    const url = `https://github.com/v2ray/domain-list-community/releases/latest/download/dlc.dat`;
    const tempPath = Path.resolve(app.getPath('temp'), './dlc.dat');
    this.progressDownload(url, tempPath).subscribe((state) => {
      const webContents = global.appInstance.mainWindow.webContents;
      if (state instanceof Error) {
        console.log(state);
        webContents.send('update-progress', state.message);
      } else if (typeof state === 'number') {
        webContents.send('update-progress', state);
      } else if (state === null) {
        moveSync(tempPath, this.dlcPath, { overwrite: true });
        webContents.send('update-progress', state);
      }
    });
  }

  progressDownload(url: string, path: string) {
    const subject = new Subject<number | Error | null>();
    this.progressReq = progress(request(url, { method: 'get' }))
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
    const flag = pathExistsSync(this.v2rayCorePath);
    if (!flag) {
      return;
    }
    if (this.v2rayCore) {
      this.stopV2rayCore();
    }
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
    });
    this.v2rayCore.on('err', (err) => {
      console.log(err);
      this.v2rayCore.removeAllListeners();
    });
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

  stopDownload() {
    if (this.progressReq) {
      this.progressReq.abort();
    }
  }

  async start() {
    this.stop();
    const { extensionMode } = await global.appInstance.config.getGuiConfig(['extensionMode']);
    if (!extensionMode) {
      this.startV2rayCore();
    }
  }

  stop() {
    if (this.v2rayCore) {
      this.stopV2rayCore();
    }
  }
}

function getPath() {
  if (process.env.USE_SYSTEM_7ZA === 'true') {
    return '7za';
  }

  if (process.platform === 'darwin') {
    return Path.join(__dirname, 'assets', '7zip-bin', 'mac', '7za');
  } else if (process.platform === 'win32') {
    return Path.join(__dirname, 'assets', '7zip-bin', 'win', process.arch, '7za.exe');
  } else {
    return Path.join(__dirname, 'assets', '7zip-bin', 'linux', process.arch, '7za');
  }
}
