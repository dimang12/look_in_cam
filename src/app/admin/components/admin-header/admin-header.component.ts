import { Component, Output, EventEmitter } from '@angular/core';
import { AdminAuthService } from '../../services/admin-auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  
  currentUser: any;

  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.currentUser = this.adminAuthService.getCurrentUser();
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  onLogout(): void {
    this.adminAuthService.logout();
    this.snackBar.open('Logged out successfully', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.router.navigate(['/admin/login']);
  }
}