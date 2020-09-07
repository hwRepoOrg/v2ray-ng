import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'v2ray-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  public menuCollapsed = false;
  ngOnInit() {}
}
