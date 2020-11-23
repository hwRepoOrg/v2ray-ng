import { execFileSync, execSync } from 'child_process';
import { app } from 'electron';
import extract from 'extract-zip';
import { chmodSync, constants } from 'fs';
import { createWriteStream, moveSync, pathExists, removeSync, statSync } from 'fs-extra';
import * as Path from 'path';
import request from 'request';
import progress from 'request-progress';

let tempPath: string;

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

export function setWinSystemProxy(status: boolean, type: 'socks' | 'http', port?: number) {}

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
      extract(tempPath, { dir: Path.resolve(path) })
        .then(() => {
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
