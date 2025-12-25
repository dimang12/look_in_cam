import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService, User } from '../../services/admin.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['username', 'email', 'role', 'createdAt', 'lastActive', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<User>();
  loading = true;

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.snackBar.open('Error loading users', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: user ? { ...user } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.saveUser(result);
        this.snackBar.open(
          user ? 'User updated successfully' : 'User created successfully',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      }
    });
  }

  toggleUserStatus(user: User): void {
    this.adminService.toggleUserStatus(user.id);
    this.snackBar.open(
      `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
      'Close',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.adminService.deleteUser(user.id);
      this.snackBar.open('User deleted successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'role-badge admin-role';
      case 'moderator':
        return 'role-badge moderator-role';
      default:
        return 'role-badge user-role';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}