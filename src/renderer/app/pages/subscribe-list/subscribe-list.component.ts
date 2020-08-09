import { Component, OnInit } from '@angular/core';
import { ElectronService } from '@renderer/services/electron.service';
import { ISubscribeConfig } from '@typing/config.interface';

@Component({
  selector: 'v2ray-subscribe-list',
  templateUrl: './subscribe-list.component.html',
  styleUrls: ['./subscribe-list.component.less'],
})
export class SubscribeListComponent implements OnInit {
  loading = false;
  list: ISubscribeConfig[] = [];

  constructor(private es: ElectronService) {}

  ngOnInit(): void {}
}
