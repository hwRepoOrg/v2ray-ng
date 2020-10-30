import { execFileSync, execSync } from 'child_process';
import { app } from 'electron';
import { chmodSync, constants } from 'fs';
import { createWriteStream, moveSync, pathExists, removeSync, statSync } from 'fs-extra';
import * as Path from 'path';
import request from 'request';
import progress from 'request-progress';

let tempPath: string;

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

export function execShell(cmd: string): string {
  console.log(cmd);
  try {
    return execSync(cmd).toString();
  } catch (e) {
    console.error(e);
    return '';
  }
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

export function setMacOSSystemProxy(status: boolean, type?: 'socks' | 'http', port?: number) {
  execShell(`networksetup -listnetworkserviceorder | grep 'Hardware Port'`)
    .split('\n')
    .filter((s) => !!s)
    .map((s) => [s.match(/Hardware\sPort:\s(.+)?,/)[1], s.match(/Device:\s(.+)?\)$/)[1]])
    .forEach((activeNet) => {
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

export async function updateMellowCore(path: string) {
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
  tempPath = Path.resolve(app.getPath('temp'), './mellow-core');
  removeSync(tempPath);
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
      try {
        const p7zPath = getPath();
        setExecutable(p7zPath);
        execFileSync(p7zPath, [
          'x',
          tempPath,
          `-o${Path.resolve(path)}`,
          `v2ray${process.platform === 'win32' ? '.exe' : ''}`,
          '-aoa',
        ]);
        execFileSync(p7zPath, [
          'x',
          tempPath,
          `-o${Path.resolve(path)}`,
          `v2ctl${process.platform === 'win32' ? '.exe' : ''}`,
          '-aoa',
        ]);
        execFileSync(p7zPath, ['x', tempPath, `-o${Path.resolve(path)}`, `geosite.dat`, '-aoa']);
        global.appInstance.mainWindow.webContents.send('update-progress', null);
      } catch (e) {
        global.appInstance.mainWindow.webContents.send('update-progress', e.message);
      }
      removeSync(tempPath);
    })
    .pipe(createWriteStream(tempPath, { flags: 'w' }));
  return progressReq;
}

export async function updateDLCData(path: string) {
  const url = `https://github.com/v2fly/domain-list-community/releases/latest/download/dlc.dat`;
  tempPath = Path.resolve(app.getPath('temp'), './dlc.dat');
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
