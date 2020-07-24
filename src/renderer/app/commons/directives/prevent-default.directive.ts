import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[v2ray-prevent-default]',
})
export class PreventDefaultDirective {
  constructor(private eleRef: ElementRef<HTMLElement>) {
    console.log(this.eleRef);
  }

  @HostListener('click', ['$event'])
  click(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
  }
}
