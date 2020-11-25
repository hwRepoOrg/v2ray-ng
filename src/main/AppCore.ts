import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { pathExists } from 'fs-extra';
import * as Path from 'path';
import request from 'request';
import { DEFAULT_INBOUNDS } from '../config';
import { environment } from '../environments/environment';
import { AppConfig } from './AppConfig';
import { getDLCUpdatedTime, getV2rayCoreVersion, updateDLCData, updateV2rayCore } from './utils';

export class AppCore {
  private v2rayCorePath: string;
  private dlcPath: string;
  private geoipPath: string;
  private geositePath: string;
  private config: AppConfig;
  private progressReq: request.Request;
  public v2rayCore: ChildProcessWithoutNullStreams;
  public mellowCore: ChildProcessWithoutNullStreams;

  constructor() {
    this.config = global.appInstance.config;
    this.v2rayCorePath = Path.resolve(this.config.configPath, './v2ray');
    this.dlcPath = Path.resolve(this.config.configPath, './dlc.dat');
    this.geoipPath = Path.resolve(this.config.configPath, './geoip.dat');
    this.geositePath = Path.resolve(this.config.configPath, './geosite.dat');
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

  async getCoreInfo(type: 'v2ray' | 'dlc' | 'geoip' | 'geosite') {
    switch (type) {
      case 'v2ray':
        return await getV2rayCoreVersion(this.v2rayCorePath);
      case 'dlc':
        return await getDLCUpdatedTime(this.dlcPath);
      case 'geoip':
        return await getDLCUpdatedTime(this.geoipPath);
      case 'geosite':
        return await getDLCUpdatedTime(this.geositePath);
    }
  }

  async updateCore(type: 'v2ray' | 'dlc' | 'geoip' | 'geosite') {
    switch (type) {
      case 'v2ray':
        this.progressReq = await updateV2rayCore(this.config.configPath);
        break;
      case 'dlc':
        this.progressReq = await updateDLCData(
          this.dlcPath,
          `https://github.com/v2fly/domain-list-community/releases/latest/download/dlc.dat`
        );
        break;
      case 'geoip':
        this.progressReq = await updateDLCData(
          this.geoipPath,
          `https://raw.githubusercontent.com/Loyalsoldier/v2ray-rules-dat/release/geoip.dat`
        );
        break;
      case 'geosite':
        this.progressReq = await updateDLCData(
          this.geositePath,
          'https://raw.githubusercontent.com/Loyalsoldier/v2ray-rules-dat/release/geosite.dat'
        );
        break;
    }
  }

  async startV2rayCore() {
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

  async stopDownload() {
    if (this.progressReq) {
      this.progressReq.abort();
    }
  }

  async start() {
    try {
      global.appInstance.clearSystemProxy();
      await this.stop();
      await this.startV2rayCore();
      const inbounds = (await this.config.getConfigByPath(this.config.inboundsConfigPath, DEFAULT_INBOUNDS)).filter(
        (item) => item.systemProxy
      );
      while (inbounds.length) {
        const inbound = inbounds.pop();
        await this.config.setSystemProxy(true, inbound.protocol as any, inbound.port);
      }
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
    } catch (e) {
      console.error(e);
    }
  }
}
