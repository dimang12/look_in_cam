import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },
    {
      label: 'User Management',
      icon: 'people',
      route: '/admin/users'
    },
    {
      label: 'Content Management',
      icon: 'article',
      route: '/admin/content',
      badge: 3
    },
    {
      label: 'News Articles',
      icon: 'newspaper',
      route: '/admin/news'
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/admin/settings'
    }
  ];

  constructor(private router: Router) {}

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}