import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ElectronService } from '@renderer/services/electron.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'v2ray-app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.less'],
})
export class AppSettingsComponent implements OnInit {
  public v2rayVersion: string;
  public mellowVersion: string;
  public mellowLoading = false;
  public v2rayLoading = false;
  public progress$ = new Subject<number>();
  private modalRef: NzModalRef<any>;

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
    this.getMellowCoreVersion();
    this.getV2rayCoreVersion();
  }

  formatVersionStr(version: string) {
    return version.replace(/(\n|\s)/g, '');
  }

  getMellowCoreVersion() {
    this.es.app.core
      .getMellowCoreVersion()
      .then((version) => {
        this.mellowVersion = this.formatVersionStr(version);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  getV2rayCoreVersion() {
    this.es.app.core
      .getV2rayCoreVersion()
      .then((version) => {
        this.v2rayVersion = this.formatVersionStr(`v${version.match(/V2Ray\s(.*)?\s\(V2F/)[1]}`);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  getLatestVersion(repo: string, version: string) {
    return this.http.get(`https://api.github.com/repos/${repo}/releases/latest`).pipe(
      filter((res: any) => {
        if (version === res.tag_name) {
          this.msg.info('当前已是最新版本');
          this.mellowLoading = false;
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

  updateMellow() {
    this.mellowLoading = true;
    this.getLatestVersion('mellow-io/go-tun2socks', this.mellowVersion).subscribe(() => {
      const sub = this.es.ipcRenderer.on('mellow-core-update-progress', (ev, progress: string | null | number) => {
        this.zone.run(() => {
          if (progress === null) {
            this.modalRef.destroy();
            this.updateProgress(100);
            sub.removeAllListeners('mellow-core-update-progress');
            this.mellowLoading = false;
            this.msg.success(`更新成功`);
            this.getMellowCoreVersion();
          } else if (typeof progress === 'string') {
            sub.removeAllListeners('mellow-core-update-progress');
            this.modalRef.destroy();
            this.msg.error(`更新失败：${progress}`);
            this.mellowLoading = false;
          } else {
            this.updateProgress(Math.round(progress * 100));
          }
        });
      });
      this.es.app.core.updateMellowCore();
    });
  }

  updateV2rayCore() {
    this.v2rayLoading = true;
    this.getLatestVersion('v2ray/v2ray-core', this.v2rayVersion).subscribe(() => {
      const sub = this.es.ipcRenderer.on('v2ray-core-update-progress', (_ev, progress: string | null | number) => {
        this.zone.run(() => {
          if (progress === null) {
            this.modalRef.destroy();
            this.updateProgress(100);
            sub.removeAllListeners('v2ray-core-update-progress');
            this.v2rayLoading = false;
            this.msg.success('更新成功');
            this.getV2rayCoreVersion();
          } else if (typeof progress === 'string') {
            sub.removeAllListeners('v2ray-core-update-progress');
            this.modalRef.destroy();
            this.msg.error(`更新失败：${progress}`);
          } else {
            this.updateProgress(Math.round(progress * 100));
          }
        });
      });
      this.es.app.core.updateV2rayCore();
    });
  }

  updateProgress(progress: number) {
    this.progress$.next(progress);
  }
}
