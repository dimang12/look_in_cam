import { Component, OnInit } from '@angular/core';
import { AdminService, ContentItem } from '../../services/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContentDialogComponent } from '../content-dialog/content-dialog.component';

@Component({
  selector: 'app-content-management',
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.css']
})
export class ContentManagementComponent implements OnInit {
  contentItems: ContentItem[] = [];
  filteredContent: ContentItem[] = [];
  selectedFilter: 'all' | 'published' | 'draft' | 'archived' = 'all';
  searchQuery = '';
  loading = true;

  statusColors = {
    published: '#4caf50',
    draft: '#ff9800', 
    archived: '#757575'
  };

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadContent();
  }

  private loadContent(): void {
    this.loading = true;
    this.adminService.getContent().subscribe({
      next: (content) => {
        this.contentItems = content;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading content:', error);
        this.loading = false;
        this.snackBar.open('Error loading content', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.contentItems];

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.status === this.selectedFilter);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    }

    // Sort by created date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.filteredContent = filtered;
  }

  onFilterChange(filter: 'all' | 'published' | 'draft' | 'archived'): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  openContentDialog(content?: ContentItem): void {
    const dialogRef = this.dialog.open(ContentDialogComponent, {
      width: '600px',
      data: content ? { ...content } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.saveContent(result);
        this.snackBar.open(
          content ? 'Content updated successfully' : 'Content created successfully',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      }
    });
  }

  updateContentStatus(content: ContentItem, newStatus: 'draft' | 'published' | 'archived'): void {
    this.adminService.updateContentStatus(content.id, newStatus);
    this.snackBar.open('Content status updated', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  deleteContent(content: ContentItem): void {
    if (confirm(`Are you sure you want to delete "${content.title}"?`)) {
      this.adminService.deleteContent(content.id);
      this.snackBar.open('Content deleted successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'news':
        return 'newspaper';
      case 'article':
        return 'article';
      case 'announcement':
        return 'campaign';
      default:
        return 'description';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getContentStats() {
    return {
      total: this.contentItems.length,
      published: this.contentItems.filter(c => c.status === 'published').length,
      draft: this.contentItems.filter(c => c.status === 'draft').length,
      archived: this.contentItems.filter(c => c.status === 'archived').length
    };
  }
}