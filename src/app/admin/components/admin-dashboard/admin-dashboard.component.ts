import { Component, OnInit } from '@angular/core';
import { AdminService, AdminStats } from '../../services/admin.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { NewsArticleService } from '../../services/news-article.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  currentUser: any;
  todayNewsCount = 0;

  constructor(
    private adminService: AdminService,
    private adminAuthService: AdminAuthService,
    private newsArticleService: NewsArticleService
  ) {
    this.currentUser = this.adminAuthService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadTodayNewsCount();
  }

  private loadStats(): void {
    this.adminService.getStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  private loadTodayNewsCount(): void {
    this.newsArticleService.getTodayPublishedCount().subscribe(count => {
      this.todayNewsCount = count;
    });
  }

  get todayDate(): Date {
    return new Date();
  }
}