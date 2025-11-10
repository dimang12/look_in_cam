import { Component, OnInit } from '@angular/core';
import { UIComponentsService } from './ui-components.service';

@Component({
  selector: 'app-loading-overlay',
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
  `,
  styles: [`.loading-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);z-index:1050}`]
})
export class AppLoadingOverlayComponent implements OnInit {
  isLoading = false;
  constructor(private ui: UIComponentsService) {}
  ngOnInit(): void {
    this.ui.isLoading().subscribe(v => this.isLoading = v);
  }
}

