import { exec, execFileSync } from 'child_process';
import { app } from 'electron';
import extract from 'extract-zip';
import { chmodSync, constants } from 'fs';
import { createWriteStream, moveSync, pathExists, removeSync, statSync } from 'fs-extra';
import * as Path from 'path';
import request from 'request';
import progress from 'request-progress';

let tempPath: string;

export async function execShell(cmd: string): Promise<string> {
  console.log(cmd);
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout ?? stderr);
      }
    });
  });
}

export function execFile(file: string, args: any[]) {
  console.log(file, args);
  return execFileSync(file, args).toString();
}

export function setExecutable(filePath: string) {
  switch (process.platform) {
    case 'linux':
    case 'darwin':
      chmodSync(filePath, constants.S_IXUSR);
      break;
  }
}

function progressDownload(url: string) {
  return progress(
    request(url, { method: 'get', proxy: global.appInstance.core.v2rayCore ? 'http://127.0.0.1:1087' : null })
  );
}

export async function setMacOSSystemProxy(status: boolean, type?: 'socks' | 'http', port?: number) {
  const out = await execShell(`networksetup -listnetworkserviceorder | grep 'Hardware Port'`);
  const activatedNets = out
    .split('\n')
    .filter((s) => !!s)
    .map((s) => [s.match(/Hardware\sPort:\s(.+)?,/)[1], s.match(/Device:\s(.+)?\)$/)[1]]);
  activatedNets.forEach((activeNet) => {
    switch (type) {
      case 'socks':
        execShell(
          `networksetup ${status ? '-setsocksfirewallproxy' : '-setsocksfirewallproxystate'} "${activeNet[0]}" ${
            status ? `"127.0.0.1" ${port}` : 'off'
          }`
        );
        break;
      case 'http':
        execShell(
          `networksetup ${status ? '-setsecurewebproxy' : '-setsecurewebproxystate'} "${activeNet[0]}" ${
            status ? `"127.0.0.1" ${port}` : 'off'
          }`
        );
        execShell(
          `networksetup ${status ? '-setwebproxy' : '-setwebproxystate'} "${activeNet[0]}" ${
            status ? `"127.0.0.1" ${port}` : 'off'
          }`
        );
        break;
    }
  });
}

export async function setWinSystemProxy(status: boolean, type: 'socks' | 'http', port?: number) {
  if (status) {
    return await execShell(`netsh winhttp reset proxy`);
  } else {
    switch (type) {
      case 'socks':
        return await execShell(
          `netsh winhttp set proxy proxy-server="socks=127.0.0.1:${port}" bypass-list="localhost;192.168.*;127.0.0.1"`
        );
      case 'http':
        return await execShell(`netsh winhttp set proxy 127.0.0.1:${port} bypass-list="localhost;192.168.*;127.0.0.1"`);
    }
  }
}

export async function getMellowCoreVersion(path: string) {
  const isExists = await pathExists(path);
  if (!isExists) {
    return '';
  }
  setExecutable(path);
  return execFileSync(`${path}`, ['-version']).toString();
}

export async function getV2rayCoreVersion(path: string) {
  const isExists = await pathExists(path);
  if (!isExists) {
    return '';
  }
  setExecutable(path);
  return execFileSync(`${path}`, ['-version']).toString();
}

export async function getDLCUpdatedTime(path: string) {
  const isExists = await pathExists(path);
  if (!isExists) {
    return '';
  }
  const info = statSync(path);
  return +info.mtime;
}

function onProgress(state: any) {
  if (state) {
    global.appInstance.mainWindow.webContents.send('update-progress', state.percent);
  }
}

function onError(err: Error) {
  console.error(err);
  global.appInstance.mainWindow.webContents.send('update-progress', err.message);
  removeSync(tempPath);
}

export async function updateV2rayCore(path: string) {
  let url = `https://github.com/v2fly/v2ray-core/releases/latest/download/`;
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
  tempPath = Path.resolve(app.getPath('temp'), './v2ray-core.zip');
  removeSync(tempPath);
  const progressReq = progressDownload(url);
  progressReq
    .on('progress', onProgress)
    .on('error', onError)
    .on('end', () => {
      extract(tempPath, { dir: Path.resolve(app.getPath('temp')) })
        .then(() => {
          moveSync(Path.resolve(app.getPath('temp'), './v2ray'), Path.resolve(path, './v2ray'), { overwrite: true });
          global.appInstance.mainWindow.webContents.send('update-progress', null);
        })
        .catch((err) => {
          global.appInstance.mainWindow.webContents.send('update-progress', err.message);
        })
        .finally(() => {
          removeSync(tempPath);
        });
    })
    .pipe(createWriteStream(tempPath, { flags: 'w' }));
  return progressReq;
}

export async function updateDLCData(path: string, url: string) {
  tempPath = Path.resolve(app.getPath('temp'), './rules.dat');
  const progressReq = progressDownload(url);
  progressReq
    .on('progress', onProgress)
    .on('error', onError)
    .on('end', () => {
      moveSync(tempPath, path, { overwrite: true });
      global.appInstance.mainWindow.webContents.send('update-progress', null);
    })
    .pipe(createWriteStream(tempPath, { flags: 'w' }));
  return progressReq;
}
