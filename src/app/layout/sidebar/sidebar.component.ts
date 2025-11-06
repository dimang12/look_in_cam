import { Component, OnInit, Output, EventEmitter } from '@angular/core';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
}

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
  
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard' },
    { 
      label: 'Products', 
      icon: 'inventory_2', 
      children: [
        { label: 'All Products', icon: 'list', route: '/products' },
        { label: 'Add Product', icon: 'add', route: '/products/add' },
        { label: 'Categories', icon: 'category', route: '/products/categories' }
      ]
    },
    { 
      label: 'Orders', 
      icon: 'shopping_cart',
      children: [
        { label: 'All Orders', icon: 'list', route: '/orders' },
        { label: 'Pending Orders', icon: 'schedule', route: '/orders/pending' },
        { label: 'Completed Orders', icon: 'check_circle', route: '/orders/completed' }
      ]
    },
    { label: 'Customers', icon: 'people', route: '/customers' },
    { 
      label: 'Analytics', 
      icon: 'bar_chart',
      children: [
        { label: 'Sales Report', icon: 'trending_up', route: '/analytics/sales' },
        { label: 'Customer Report', icon: 'people', route: '/analytics/customers' },
        { label: 'Revenue Report', icon: 'attach_money', route: '/analytics/revenue' }
      ]
    },
    { 
      label: 'Settings', 
      icon: 'settings',
      children: [
        { label: 'General', icon: 'tune', route: '/settings/general' },
        { label: 'Users', icon: 'person', route: '/settings/users' },
        { label: 'Permissions', icon: 'lock', route: '/settings/permissions' }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
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
      }
    } else {
      this.selectedMenuItem = null;
      this.expandedMenus.clear();
    }
    this.menuSelected.emit(this.selectedMenuItem);
  }

  getSelectedMenuItem(): MenuItem | null {
    return this.selectedMenuItem;
  }
}


