import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UtilsService } from '@renderer/commons/services/utils.service';
import { IConfigOutbound } from '@typing/config.interface';

@Component({
  selector: 'v2ray-node-card',
  templateUrl: './node-card.component.html',
  styleUrls: ['./node-card.component.less'],
})
export class NodeCardComponent {
  @Input() public activated = false;
  @Input() public nodeConfig: IConfigOutbound;
  @Output() public vEdit = new EventEmitter<IConfigOutbound>();
  @Output() public vSelect = new EventEmitter<IConfigOutbound>();

  constructor(public utilsSrv: UtilsService) {
    console.log('123');
  }

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
