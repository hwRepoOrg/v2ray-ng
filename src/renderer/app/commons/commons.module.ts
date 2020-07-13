import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { JsonToObjectPipe } from './pipes/json-to-object.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [JsonToObjectPipe],
  exports: [JsonToObjectPipe],
})
export class CommonsModule {}
