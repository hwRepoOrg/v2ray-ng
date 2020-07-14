import { Component, Input, OnInit } from '@angular/core';
import { UtilsService } from '@renderer/commons/services/utils.service';
import { IConfigOutbound } from '@typing/config.interface';

@Component({
  selector: 'v2ray-node-card',
  templateUrl: './node-card.component.html',
  styleUrls: ['./node-card.component.less'],
})
export class NodeCardComponent implements OnInit {
  @Input() nodeConfig: IConfigOutbound;

  constructor(public utilsSrv: UtilsService) {}

  ngOnInit(): void {}
}
