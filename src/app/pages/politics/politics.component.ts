import { Component, OnInit } from '@angular/core';
import { DateRangeMode } from '../../components/calendar-controls/calendar-controls.component';
import { FirebaseService } from '../../services/firebase.service';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedDate: Date;
  source: string;
  category: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-politics',
  templateUrl: './politics.component.html',
  styleUrls: ['./politics.component.css']
})
export class PoliticsComponent implements OnInit {

  // Filter options
  selectedTimeFilter: 'day' | 'week' | 'month' = 'week';
  searchQuery = '';

  // Calendar controls
  dateRangeMode: DateRangeMode = 'week';
  selectedDate: Date = new Date();

  // News data
  allNewsItems: NewsItem[] = [];
  filteredNewsItems: NewsItem[] = [];
  selectedNewsItem: NewsItem | null = null;

  // Loading state
  loading = false;
  error: string | null = null;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.loadNewsArticles();
  }

  /**
   * Load news articles from Firestore collection
   */
  async loadNewsArticles(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Get news articles from Firestore
      const articles = await this.firebaseService.getNewsArticles();
      
      // Transform Firestore data to NewsItem format
      this.allNewsItems = articles.map(article => ({
        id: article.id || `temp_${Date.now()}_${Math.random()}`,
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
        publishedDate: this.parseDate(article.publishedDate || article.createdAt),
        source: article.source || 'Unknown Source',
        category: article.category || 'General',
        imageUrl: article.imageUrl
      }));

      console.log(`Loaded ${this.allNewsItems.length} news articles from Firestore`);
      
      // Apply filters after loading
      this.applyFilters();

    } catch (error) {
      console.error('Error loading news articles:', error);
      this.error = 'Failed to load news articles. Please try again later.';
      
      // Fallback to empty array
      this.allNewsItems = [];
      this.filteredNewsItems = [];
      
    } finally {
      this.loading = false;
    }
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateValue: any): Date {
    if (!dateValue) return new Date();
    
    // Handle Firestore Timestamp
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    // Handle string or number dates
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    return new Date();
  }

  /**
   * Apply time and search filters to news items
   */
  applyFilters(): void {
    let filtered = [...this.allNewsItems];

    // Apply time filter
    const now = new Date();
    const timeThreshold = new Date();
    
    switch (this.selectedTimeFilter) {
      case 'day':
        timeThreshold.setDate(now.getDate() - 1);
        break;
      case 'week':
        timeThreshold.setDate(now.getDate() - 7);
        break;
      case 'month':
        timeThreshold.setMonth(now.getMonth() - 1);
        break;
    }

    filtered = filtered.filter(item => item.publishedDate >= timeThreshold);

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      );
    }

    this.filteredNewsItems = filtered.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
  }

  /**
   * Handle time filter change
   */
  onTimeFilterChange(filter: 'day' | 'week' | 'month'): void {
    this.selectedTimeFilter = filter;
    this.applyFilters();
  }

  /**
   * Handle search input change
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Select a news item to show details
   */
  selectNewsItem(item: NewsItem): void {
    this.selectedNewsItem = item;
  }

  /**
   * Close news detail view
   */
  closeNewsDetail(): void {
    this.selectedNewsItem = null;
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('km', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Handle calendar date range mode change
   */
  setDateRangeMode(mode: DateRangeMode): void {
    this.dateRangeMode = mode;
    // Sync with time filter
    this.selectedTimeFilter = mode === 'today' ? 'day' : mode;
    this.applyFilters();
  }

  /**
   * Handle calendar date change
   */
  onCalendarDateChange(date: Date): void {
    this.selectedDate = date;
    this.applyFilters();
  }

  /**
   * Handle previous period navigation
   */
  goToPreviousPeriod(): void {
    const current = new Date(this.selectedDate);
    if (this.dateRangeMode === 'today') {
      current.setDate(current.getDate() - 1);
    } else if (this.dateRangeMode === 'week') {
      current.setDate(current.getDate() - 7);
    } else if (this.dateRangeMode === 'month') {
      current.setMonth(current.getMonth() - 1);
    }
    this.selectedDate = current;
    this.applyFilters();
  }

  /**
   * Handle next period navigation
   */
  goToNextPeriod(): void {
    const current = new Date(this.selectedDate);
    if (this.dateRangeMode === 'today') {
      current.setDate(current.getDate() + 1);
    } else if (this.dateRangeMode === 'week') {
      current.setDate(current.getDate() + 7);
    } else if (this.dateRangeMode === 'month') {
      current.setMonth(current.getMonth() + 1);
    }
    this.selectedDate = current;
    this.applyFilters();
  }

  /**
   * Get date range label for display
   */
  getDateRangeLabel(): string {
    const date = new Date(this.selectedDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    
    if (this.dateRangeMode === 'today') {
      return date.toLocaleDateString('en-US', options);
    } else if (this.dateRangeMode === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', options)}`;
    } else if (this.dateRangeMode === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return '';
  }
}