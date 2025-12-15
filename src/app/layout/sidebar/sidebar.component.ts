import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MENU_ITEMS, MenuItem } from './menu-items';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  expandedMenus: Set<string> = new Set();
  selectedMenuItem: MenuItem | null = null;
  @Output() menuSelected = new EventEmitter<MenuItem | null>();

  menuItems: MenuItem[] = MENU_ITEMS;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Auto-select parent menu if current URL matches one of its existing child routes
    const url = this.router.url;
    for (const item of this.menuItems) {
      if (this.hasSubmenu(item)) {
        const matchesChild = (item.children || []).some(c => !!c.route && url.startsWith(c.route!));
        const matchesSelf = !!item.route && url.startsWith(item.route);
        if (matchesChild || matchesSelf) {
          this.selectedMenuItem = item;
          this.expandedMenus.clear();
          this.expandedMenus.add(item.label);
          break;
        }
      }
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  hasSubmenu(item: MenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  isExpanded(item: MenuItem): boolean {
    return this.expandedMenus.has(item.label);
  }

  toggleSubmenu(item: MenuItem, event: Event): void {
    event.preventDefault();
    if (this.hasSubmenu(item)) {
      if (this.selectedMenuItem?.label === item.label) {
        this.selectedMenuItem = null;
        this.expandedMenus.delete(item.label);
      } else {
        this.selectedMenuItem = item;
        this.expandedMenus.clear();
        this.expandedMenus.add(item.label);
      }
    }
  }

  selectMenuItem(item: MenuItem): void {
    if (this.hasSubmenu(item)) {
      if (this.selectedMenuItem?.label === item.label) {
        // Deselect if clicking the same item
        this.selectedMenuItem = null;
        this.expandedMenus.clear();
      } else {
        this.selectedMenuItem = item;
        this.expandedMenus.clear();
        this.expandedMenus.add(item.label);

        // Attempt default navigation only if the route exists in current app config
        const target = item.defaultSelected || (item.children && item.children[0]?.route) || item.route;
        if (target && this.routeExists(target)) {
          this.router.navigateByUrl(target);
        }
      }
    } else {
      this.selectedMenuItem = null;
      this.expandedMenus.clear();
      // For leaf items, the template routerLink handles navigation
    }
    this.menuSelected.emit(this.selectedMenuItem);
  }

  // Check if a given absolute URL matches a configured top-level route.
  // Only navigates when it's present to avoid errors for non-existing routes.
  private routeExists(url: string): boolean {
    const normalized = url.startsWith('/') ? url.substring(1) : url;
    return this.router.config.some(r => (r.path || '') === normalized);
  }

  getSelectedMenuItem(): MenuItem | null {
    return this.selectedMenuItem;
  }
}

