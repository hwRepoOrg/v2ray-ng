import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { app } from 'electron';
import { existsSync, mkdirSync, pathExists } from 'fs-extra';
import * as Path from 'path';
import request from 'request';
import { DEFAULT_INBOUNDS } from '../config';
import { environment } from '../environments/environment';
import { AppConfig } from './AppConfig';
import {
  execShell,
  getDLCUpdatedTime,
  getMellowCoreVersion,
  getV2rayCoreVersion,
  updateDLCData,
  updateMellowCore,
  updateV2rayCore,
} from './utils';

export class AppCore {
  private corePath = Path.resolve(app.getPath('appData'), 'v2ray-ng');
  private mellowCorePath = Path.resolve(this.corePath, './mellow_core');
  private v2rayCorePath = Path.resolve(this.corePath, './v2ray');
  private dlcPath = Path.resolve(this.corePath, './dlc.dat');
  private config: AppConfig;
  private progressReq: request.Request;
  public v2rayCore: ChildProcessWithoutNullStreams;
  public mellowCore: ChildProcessWithoutNullStreams;

  constructor() {
    this.config = global.appInstance.config;
    if (!existsSync(this.corePath)) {
      mkdirSync(this.corePath);
    }
    this.config
      .getGuiConfig(['enabled'])
      .then(({ enabled }) => enabled && pathExists(this.config.runningConfigPath))
      .then((flag) => {
        if (flag && environment.production) {
          global.appInstance.clearSystemProxy().then(() => {
            this.start();
          });
        } else {
          global.appInstance.config.setGuiConfig({ enabled: false });
        }
      });
  }

  async getCoreInfo(type: 'mellow' | 'v2ray' | 'dlc') {
    switch (type) {
      case 'mellow':
        return await await getMellowCoreVersion(this.mellowCorePath);
      case 'v2ray':
        return await getV2rayCoreVersion(this.v2rayCorePath);
      case 'dlc':
        return await getDLCUpdatedTime(this.dlcPath);
    }
  }

  async updateCore(type: 'mellow' | 'v2ray' | 'dlc') {
    switch (type) {
      case 'mellow':
        this.progressReq = await updateMellowCore(this.mellowCorePath);
        break;
      case 'v2ray':
        this.progressReq = await updateV2rayCore(this.corePath);
        break;
      case 'dlc':
        this.progressReq = await updateDLCData(this.dlcPath);
        break;
    }
  }

  async startV2rayCore(cb?: () => void) {
    const flag = await pathExists(this.v2rayCorePath);
    if (!flag) {
      return;
    }
    if (this.v2rayCore) {
      await this.stopV2rayCore();
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

  async stopV2rayCore() {
    if (this.v2rayCore) {
      await global.appInstance.clearSystemProxy();
      switch (process.platform) {
        case 'win32':
          break;
        case 'darwin':
        case 'linux':
          this.v2rayCore.kill('SIGTERM');
          this.v2rayCore = null;
          break;
      }
    }
  }

  async startMellowCore() {}

  async stopMellowCore() {
    execShell(`route delete default`);
  }

  async stopDownload() {
    if (this.progressReq) {
      this.progressReq.abort();
    }
  }

  async start() {
    global.appInstance.clearSystemProxy();
    this.stop();
    const { extensionMode } = await global.appInstance.config.getGuiConfig(['extensionMode']);
    if (!extensionMode) {
      await this.startV2rayCore();
    }
    const inbounds = await this.config.getConfigByPath(this.config.inboundsConfigPath, DEFAULT_INBOUNDS);
    inbounds.forEach((inbound) => this.config.setSystemProxy(true, inbound.protocol as any, inbound.port));
  }

  async stop() {
    if (this.v2rayCore) {
      await this.stopV2rayCore();
    }
  }
}
