import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UtilsService } from '@renderer/commons/services/utils.service';
import { IConfigOutbound } from '@typing/config.interface';

@Component({
  selector: 'v2ray-node-card',
  templateUrl: './node-card.component.html',
  styleUrls: ['./node-card.component.less'],
})
export class NodeCardComponent {
  @Input() nodeConfig: IConfigOutbound;
  @Output() vEdit = new EventEmitter<IConfigOutbound>();
  @Output() vSelect = new EventEmitter<IConfigOutbound>();

  constructor(public utilsSrv: UtilsService) {}

  emitEdit(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.vEdit.emit(this.nodeConfig);
  }

  @HostListener('click')
  select() {
    this.vSelect.emit(this.nodeConfig);
  }
}
