import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContentItem } from '../../services/admin.service';

@Component({
  selector: 'app-content-dialog',
  templateUrl: './content-dialog.component.html',
  styleUrls: ['./content-dialog.component.css']
})
export class ContentDialogComponent {
  contentForm: FormGroup;
  isEdit: boolean;
  
  types = [
    { value: 'news', label: 'News' },
    { value: 'article', label: 'Article' },
    { value: 'announcement', label: 'Announcement' }
  ];

  statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ContentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ContentItem | null
  ) {
    this.isEdit = !!data;
    
    this.contentForm = this.fb.group({
      id: [data?.id || this.generateId()],
      title: [data?.title || '', [Validators.required, Validators.minLength(5)]],
      type: [data?.type || 'news', Validators.required],
      status: [data?.status || 'draft', Validators.required],
      author: [data?.author || 'Admin'],
      createdAt: [data?.createdAt || new Date()],
      updatedAt: [data?.updatedAt || null],
      viewCount: [data?.viewCount || 0]
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onSubmit(): void {
    if (this.contentForm.valid) {
      const formValue = this.contentForm.value;
      if (this.isEdit) {
        formValue.updatedAt = new Date();
      }
      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contentForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} must be at least ${field.errors?.['minlength']?.requiredLength} characters`;
    }
    return '';
  }
}