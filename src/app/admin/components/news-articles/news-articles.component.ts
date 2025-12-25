import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin } from 'rxjs';
import { NewsArticle } from '../../models/news-article.model';
import { NewsArticleService } from '../../services/news-article.service';
import { NewsArticleFormComponent } from '../news-article-form/news-article-form.component';

@Component({
  selector: 'app-news-articles',
  templateUrl: './news-articles.component.html',
  styleUrls: ['./news-articles.component.css']
})
export class NewsArticlesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'title', 'author', 'status', 'category', 'publishedDate', 'views', 'actions'];
  dataSource = new MatTableDataSource<NewsArticle>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
  selection = new SelectionModel<NewsArticle>(true, []);

  loading = false;
  stats = {
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0
  };
  
  selectedStatus: string = 'all';
  statusOptions = [
    { value: 'all', label: 'All Articles' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Drafts' },
    { value: 'archived', label: 'Archived' }
  ];

  constructor(
    private newsArticleService: NewsArticleService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('NewsArticlesComponent: Initializing...');
    this.loadArticles();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Wire up paginator and sort after view init
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadArticles(): void {
    console.log('NewsArticlesComponent: Loading articles...');
    this.loading = true;
    
    if (this.selectedStatus === 'all') {
      this.newsArticleService.getArticles(100).subscribe({
        next: (result) => {
          console.log('NewsArticlesComponent: Received articles:', result);
          this.dataSource.data = result.articles;
          this.selection.clear();
          this.loading = false;
        },
        error: (error) => {
          console.error('NewsArticlesComponent: Error loading articles:', error);
          this.loading = false;
        }
      });
    } else {
      this.newsArticleService.getArticlesByStatus(this.selectedStatus as any).subscribe({
        next: (articles) => {
          console.log('NewsArticlesComponent: Received articles by status:', articles);
          this.dataSource.data = articles;
          this.selection.clear();
          this.loading = false;
        },
        error: (error) => {
          console.error('NewsArticlesComponent: Error loading articles by status:', error);
          this.loading = false;
        }
      });
    }
  }

  loadStats(): void {
    console.log('NewsArticlesComponent: Loading stats...');
    this.newsArticleService.getArticleStats().subscribe({
      next: (stats) => {
        console.log('NewsArticlesComponent: Received stats:', stats);
        this.stats = stats;
      },
      error: (error) => {
        console.error('NewsArticlesComponent: Error loading stats:', error);
      }
    });
  }

  // Test function to create a sample article
  createTestArticle(): void {
    console.log('NewsArticlesComponent: Creating test article...');
    const testArticle = {
      title: 'Test Article',
      content: 'This is a test article created to verify Firebase connection.',
      excerpt: 'A test article to verify the Firebase connection is working properly.',
      author: 'Test Author',
      status: 'published' as 'published',
      category: 'Technology',
      tags: ['test', 'firebase'],
      featuredImage: ''
    };

    this.newsArticleService.createArticle(testArticle).subscribe({
      next: (articleId) => {
        console.log('NewsArticlesComponent: Test article created with ID:', articleId);
        this.loadArticles();
        this.loadStats();
        alert('Test article created successfully!');
      },
      error: (error) => {
        console.error('NewsArticlesComponent: Error creating test article:', error);
        alert('Error creating test article: ' + error.message);
      }
    });
  }

  onStatusChange(): void {
    this.loadArticles();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(NewsArticleFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadArticles();
        this.loadStats();
      }
    });
  }

  openEditDialog(article: NewsArticle): void {
    const dialogRef = this.dialog.open(NewsArticleFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { mode: 'edit', article }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadArticles();
        this.loadStats();
      }
    });
  }

  deleteArticle(article: NewsArticle): void {
    if (confirm(`Are you sure you want to delete "${article.title}"?`)) {
      this.newsArticleService.deleteArticle(article.id!).subscribe({
        next: () => {
          this.loadArticles();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error deleting article:', error);
          alert('Error deleting article. Please try again.');
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'published': return '#4CAF50';
      case 'draft': return '#FF9800';
      case 'archived': return '#757575';
      default: return '#757575';
    }
  }

  toggleStatus(article: NewsArticle): void {
    if (!article.id) return;
    const newStatus: 'draft' | 'published' = article.status === 'published' ? 'draft' : 'published';
    this.newsArticleService.updateArticle(article.id, { status: newStatus }).subscribe({
      next: () => {
        // Update local row
        article.status = newStatus;
        if (newStatus === 'published') {
          article.publishedDate = new Date();
        }
        this.loadStats();
      },
      error: (error) => {
        console.error('Error toggling status', error);
        alert('Failed to change status');
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Selection helpers
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: NewsArticle): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} article`;
  }

  deleteSelected(): void {
    const ids = this.selection.selected.map(a => a.id).filter(Boolean) as string[];
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected article(s)?`)) return;

    const deletes = ids.map(id => this.newsArticleService.deleteArticle(id));
    forkJoin(deletes).subscribe({
      next: () => {
        this.loadArticles();
        this.loadStats();
      },
      error: (error) => {
        console.error('Error deleting selected articles', error);
        alert('Failed to delete some articles.');
      }
    });
  }
}