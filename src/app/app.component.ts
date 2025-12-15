import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Angular Admin Dashboard';
  selectedMenuItem: any = null;
  submenuVisible: boolean = true;

  onMenuSelected(menuItem: any): void {
    // Only update the selected menu when a parent (with children) is chosen
    // or when the sidebar explicitly clears the selection.
    if (menuItem && menuItem.children?.length) {
      this.selectedMenuItem = menuItem;
    } else if (menuItem === null) {
      this.selectedMenuItem = null;
    }
  }

  onSubmenuItemClicked(_: any): void {
    // No state change needed; keep current parent selection so submenu stays visible.
  }

  onToggleSidebar(): void {
    this.submenuVisible = !this.submenuVisible;
  }

  ngOnInit(): void {
    // Initialize any required services
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap components after view init
    this.initializeBootstrapComponents();
  }

  private initializeBootstrapComponents(): void {
    // Initialize tooltips, popovers, etc. if needed
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl: any) => {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
}
