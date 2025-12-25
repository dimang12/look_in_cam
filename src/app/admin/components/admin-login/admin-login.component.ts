import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  createAdminForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideCreatePassword = true;
  showCreateAdmin = false;
  createAdminLoading = false;

  constructor(
    private fb: FormBuilder,
    private adminAuthService: AdminAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.createAdminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    this.adminAuthService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading = true;
      
      const { email, password } = this.loginForm.value;
      
      try {
        const result = await this.adminAuthService.login(email, password);
        
        if (result.success) {
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.snackBar.open(result.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        this.snackBar.open('Login failed. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      } finally {
        this.loading = false;
      }
    }
  }

  async onCreateAdmin(): Promise<void> {
    if (this.createAdminForm.valid) {
      this.createAdminLoading = true;
      
      const { email, password, displayName } = this.createAdminForm.value;
      
      try {
        const result = await this.adminAuthService.createAdmin(email, password, displayName);
        
        if (result.success) {
          this.snackBar.open('Admin account created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.showCreateAdmin = false;
          this.createAdminForm.reset();
          // Automatically navigate to dashboard since user is now logged in
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.snackBar.open(result.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        this.snackBar.open('Failed to create admin account. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      } finally {
        this.createAdminLoading = false;
      }
    }
  }

  toggleCreateAdmin(): void {
    this.showCreateAdmin = !this.showCreateAdmin;
    if (!this.showCreateAdmin) {
      this.createAdminForm.reset();
    }
  }

  getEmailErrorMessage(formGroup: FormGroup = this.loginForm): string {
    const emailControl = formGroup.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }

  getPasswordErrorMessage(formGroup: FormGroup = this.loginForm): string {
    const passwordControl = formGroup.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  getDisplayNameErrorMessage(): string {
    const displayNameControl = this.createAdminForm.get('displayName');
    if (displayNameControl?.hasError('required')) {
      return 'Display name is required';
    }
    if (displayNameControl?.hasError('minlength')) {
      return 'Display name must be at least 2 characters';
    }
    return '';
  }
}