import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ElectronService } from '@renderer/services/electron.service';
import { IpcRenderer } from 'electron';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subject, zip } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'v2ray-app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.less'],
})
export class AppSettingsComponent implements OnInit {
  public v2rayVersion: string;
  public dlcUpdatedTime: string;
  public geoipUpdatedTime: string;
  public geositeUpdatedTime: string;
  public v2rayLoading = false;
  public dlcLoading = false;
  public geoipLoading = false;
  public geositeLoading = false;
  public progress$ = new Subject<number>();
  private modalRef: NzModalRef<any>;
  private sub: IpcRenderer;

  @ViewChild('progressTpl', { read: TemplateRef })
  progressTpl: TemplateRef<any>;

  constructor(
    public es: ElectronService,
    public http: HttpClient,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    zip(
      this.getCoreVersion('v2ray'),
      this.getCoreVersion('dlc'),
      this.getCoreVersion('geoip'),
      this.getCoreVersion('geosite')
    ).subscribe(([v2rayVersion, dlcUpdateTime, geoipUpdatedTime, geositeUpdatedTime]) => {
      this.v2rayVersion = v2rayVersion;
      this.dlcUpdatedTime = dlcUpdateTime;
      this.geoipUpdatedTime = geoipUpdatedTime;
      this.geositeUpdatedTime = geositeUpdatedTime;
    });
  }

  formatVersionStr(version: string, type: 'v2ray' | 'dlc' | 'geoip' | 'geosite') {
    switch (type) {
      case 'v2ray':
        return `v${version.match(/V2Ray\s(.*)?\s\(V2F/)[1]}`.replace(/\n|\s/g, '');
      case 'dlc':
      case 'geoip':
      case 'geosite':
        return `${new Date(version).toLocaleDateString()} ${new Date(version).toLocaleTimeString()}`;
    }
  }

  getCoreVersion(type: 'v2ray' | 'dlc' | 'geoip' | 'geosite') {
    return this.es.send('/core/getCoreInfo', type).pipe(map((res) => this.formatVersionStr(res, type)));
  }

  getLatestVersion(repo: string, version: string) {
    return this.http
      .get(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: {
          Authorization: environment.github_token,
        },
      })
      .pipe(
        catchError(() => null),
        filter((res: any) => {
          if (!res || version === res.tag_name) {
            this.msg.info('当前已是最新版本');
            this.v2rayLoading = false;
          }
          return version !== res.tag_name;
        }),
        map((res: any) => {
          this.msg.info(`检测到最新版本${res.tag_name}，开始更新。更新完毕前请不要关闭窗口`);
          this.updateProgress(0);
          this.modalRef = this.modalSrv.create({
            nzTitle: '更新进度',
            nzContent: this.progressTpl,
            nzFooter: null,
            nzClosable: false,
            nzMaskClosable: false,
          });
        })
      );
  }

  updateV2rayCore() {
    this.v2rayLoading = true;
    this.getLatestVersion('v2fly/v2ray-core', this.v2rayVersion).subscribe(() => {
      this.listenProgress(() => this.getCoreVersion('v2ray').subscribe((version) => (this.v2rayVersion = version)));
      this.es.send('/core/updateCore', 'v2ray').subscribe();
    });
  }

  updateDlc() {
    this.dlcLoading = true;
    this.getLatestVersion('v2ray/domain-list-community', '').subscribe(() => {
      this.listenProgress(() => this.getCoreVersion('dlc').subscribe((version) => (this.dlcUpdatedTime = version)));
      this.es.send('/core/updateCore', 'dlc').subscribe();
    });
  }

  listenProgress(success?: () => any, error?: (err: string) => any) {
    if (this.sub) {
      this.sub.removeAllListeners('update-progress');
    }
    this.sub = this.es.ipcRenderer.on('update-progress', (_ev, progress: string | null | number) => {
      this.zone.run(() => {
        if (progress === null) {
          this.updateProgress(100);
          this.modalRef.destroy();
          this.sub.removeAllListeners('update-progress');
          this.dlcLoading = false;
          this.v2rayLoading = false;
          this.msg.success('更新成功');
          if (success) {
            success();
          }
        } else if (typeof progress === 'string') {
          this.sub.removeAllListeners('update-progress');
          this.modalRef.destroy();
          this.msg.error(`更新失败：${progress}`);
          this.dlcLoading = false;
          this.v2rayLoading = false;
          if (error) {
            error(progress);
          }
        } else {
          this.updateProgress(Math.round(progress * 100));
        }
      });
    });
  }

  updateProgress(progress: number) {
    this.progress$.next(progress);
  }

  stopDownload() {
    this.es.send('/core/stopDownload').subscribe(() => {
      this.v2rayLoading = false;
      this.dlcLoading = false;
      if (this.sub) {
        this.sub.removeAllListeners('update-progress');
      }
      if (this.modalRef) {
        this.modalRef.destroy();
      }
    });
  }
}
