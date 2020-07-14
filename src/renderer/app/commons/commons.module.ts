import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DelonFormModule } from '@delon/form';
import { AlainThemeModule } from '@delon/theme';
import { JsonToObjectPipe } from './pipes/json-to-object.pipe';

@NgModule({
  declarations: [JsonToObjectPipe],
  exports: [
    JsonToObjectPipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DelonFormModule,
    AlainThemeModule,
  ],
})
export class CommonsModule {}
