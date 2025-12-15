import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @HostBinding('class') hostClass = 'h-full w-full flex flex-col';
  constructor() { }

  ngOnInit(): void {
  }

}

