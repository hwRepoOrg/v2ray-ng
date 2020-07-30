import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[v2ray-prevent-default]',
})
export class PreventDefaultDirective {
  constructor() {}

  @HostListener('click', ['$event'])
  click(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
  }
}
