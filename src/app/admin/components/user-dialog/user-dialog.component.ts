import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../services/admin.service';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent {
  userForm: FormGroup;
  isEdit: boolean;
  
  roles = [
    { value: 'user', label: 'User' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'admin', label: 'Admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User | null
  ) {
    this.isEdit = !!data;
    
    this.userForm = this.fb.group({
      id: [data?.id || this.generateId()],
      username: [data?.username || '', [Validators.required, Validators.minLength(3)]],
      email: [data?.email || '', [Validators.required, Validators.email]],
      role: [data?.role || 'user', Validators.required],
      isActive: [data?.isActive !== false],
      createdAt: [data?.createdAt || new Date()],
      lastActive: [data?.lastActive || null]
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} must be at least ${field.errors?.['minlength']?.requiredLength} characters`;
    }
    return '';
  }
}