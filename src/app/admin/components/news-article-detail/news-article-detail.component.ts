import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NewsArticle } from '../../models/news-article.model';
import { NewsArticleService } from '../../services/news-article.service';
import { NewsArticleFormComponent } from '../news-article-form/news-article-form.component';

@Component({
  selector: 'app-news-article-detail',
  templateUrl: './news-article-detail.component.html',
  styleUrls: ['./news-article-detail.component.css']
})
export class NewsArticleDetailComponent implements OnInit {
  article: NewsArticle | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsArticleService: NewsArticleService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (!articleId) {
      this.error = 'Invalid article id';
      return;
    }
    this.loadArticle(articleId);
  }

  private loadArticle(id: string): void {
    this.loading = true;
    this.error = null;
    this.newsArticleService.getArticleById(id).subscribe({
      next: article => {
        this.article = article;
        if (!article) {
          this.error = 'Article not found';
        }
        this.loading = false;
      },
      error: err => {
        console.error('Error loading article detail', err);
        this.error = 'Failed to load article';
        this.loading = false;
      }
    });
  }

  back(): void {
    this.router.navigate(['/admin/news']);
  }

  edit(): void {
    if (!this.article) return;
    const dialogRef = this.dialog.open(NewsArticleFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { mode: 'edit', article: this.article }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.article?.id) {
        this.loadArticle(this.article.id);
      }
    });
  }
}
