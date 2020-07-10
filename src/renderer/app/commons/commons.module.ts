import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgZorroModule } from '@renderer/ng-zorro.module';
import { JsonToObjectPipe } from './pipes/json-to-object.pipe';

@NgModule({
  imports: [CommonModule, NgZorroModule],
  declarations: [JsonToObjectPipe],
  exports: [JsonToObjectPipe],
})
export class CommonsModule {}
