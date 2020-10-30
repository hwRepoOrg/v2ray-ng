import { ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import * as defaultGateway from 'default-gateway';
import * as log from 'electron-log';
import { pathExists } from 'fs-extra';
import * as ip from 'ip';
import * as Path from 'path';
import request from 'request';
import * as sudoExec from 'sudo-prompt';
import { DEFAULT_INBOUNDS } from '../config';
import { environment } from '../environments/environment';
import { AppConfig } from './AppConfig';
import {
  execFile,
  execShell,
  getDLCUpdatedTime,
  getMellowCoreVersion,
  getV2rayCoreVersion,
  setExecutable,
  updateDLCData,
  updateMellowCore,
  updateV2rayCore,
} from './utils';

const TUN_ADDR = '10.255.0.2';
const TUN_GW = '10.255.0.1';

export class AppCore {
  private mellowCorePath: string;
  private v2rayCorePath: string;
  private dlcPath: string;
  private config: AppConfig;
  private progressReq: request.Request;
  public v2rayCore: ChildProcessWithoutNullStreams;
  public mellowCore: ChildProcessWithoutNullStreams;

  constructor() {
    this.config = global.appInstance.config;
    this.mellowCorePath = Path.resolve(this.config.configPath, './mellow_core');
    this.v2rayCorePath = Path.resolve(this.config.configPath, './v2ray');
    this.dlcPath = Path.resolve(this.config.configPath, './dlc.dat');
    this.init();
  }

  init() {
    this.config
      .getGuiConfig(['enabled'])
      .then(({ enabled }) => enabled && pathExists(this.config.runningConfigPath))
      .then((res) => {
        if (res && environment.production) {
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
        return await getMellowCoreVersion(this.mellowCorePath);
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
        this.progressReq = await updateV2rayCore(this.config.configPath);
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
      await this.stop();
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

  async stopMellowCore() {}

  async stopDownload() {
    if (this.progressReq) {
      this.progressReq.abort();
    }
  }

  async start() {
    try {
      global.appInstance.clearSystemProxy();
      this.stop();
      const { extensionMode } = await global.appInstance.config.getGuiConfig(['extensionMode']);
      if (!extensionMode) {
        await this.startV2rayCore();
      } else {
        await this.startMellowCore();
      }
      const inbounds = await this.config.getConfigByPath(this.config.inboundsConfigPath, DEFAULT_INBOUNDS);
      inbounds.forEach((inbound) => this.config.setSystemProxy(true, inbound.protocol as any, inbound.port));
    } catch (e) {
      console.error(e);
    }
  }

  async stop() {
    try {
      await global.appInstance.clearSystemProxy();
      if (this.v2rayCore) {
        await this.stopV2rayCore();
      }
      const { extensionMode } = await this.config.getGuiConfig(['extensionMode']);
      if (extensionMode) {
        await this.stopMellowCore();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
