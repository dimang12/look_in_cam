import { Component, OnInit } from '@angular/core';
import { DateRangeMode } from '../../components/calendar-controls/calendar-controls.component';
import { FirebaseService } from '../../services/firebase.service';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source_url: string;
  date: Date;
  snippet: string;
  content: string;
  summary_md?: string;
  political_movement?: string;
  cambodia_impact?: string;
  khmer_translation?: string;
  relevant_to_border_conflict?: boolean;
  analyzed_at?: string;
  viewed: number;
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
        id: article.doc_id || `temp_${Date.now()}_${Math.random()}`,
        title: article.title || '',
        url: article.url || '',
        source_url: article.source_url || '',
        snippet: article.snippet || '',
        content: article.content || '',
        date: this.parseDate(article.date || article.analyzed_at),
        summary_md: article.summary_md,
        political_movement: article.political_movement,
        cambodia_impact: article.cambodia_impact,
        khmer_translation: article.khmer_translation,
        relevant_to_border_conflict: article.relevant_to_border_conflict,
        analyzed_at: article.analyzed_at,
        viewed: article.viewed || 0
      }));

      console.log(`Loaded ${this.allNewsItems.length} news articles from Firestore`);
      
      // Debug: Log first article to see structure
      if (this.allNewsItems.length > 0) {
        console.log('First article structure:', this.allNewsItems[0]);
        console.log('Fields check:', {
          summary_md: this.allNewsItems[0].summary_md,
          political_movement: this.allNewsItems[0].political_movement,
          cambodia_impact: this.allNewsItems[0].cambodia_impact,
          khmer_translation: this.allNewsItems[0].khmer_translation
        });
      }
      
      // Apply filters after loading
      this.applyFilters();

      // Select first article by default if not already selected
      if (this.filteredNewsItems.length > 0 && !this.selectedNewsItem) {
        this.selectedNewsItem = this.filteredNewsItems[0];
      }

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

    filtered = filtered.filter(item => item.date >= timeThreshold);

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.snippet.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      );
    }

    // Sort by viewed count (most viewed first), then by published date (newest first)
    filtered.sort((a, b) => {
      // First sort by viewed count (descending)
      if (b.viewed !== a.viewed) {
        return b.viewed - a.viewed;
      }
      // Then sort by published date (newest first)
      return b.date.getTime() - a.date.getTime();
    });

    this.filteredNewsItems = filtered;
    
    // Select first article if none selected and articles are available
    if (this.filteredNewsItems.length > 0 && !this.selectedNewsItem) {
      this.selectedNewsItem = this.filteredNewsItems[0];
    }
    
    // If current selection is not in filtered results, select first one
    if (this.selectedNewsItem && !this.filteredNewsItems.find(item => item.id === this.selectedNewsItem?.id)) {
      this.selectedNewsItem = this.filteredNewsItems.length > 0 ? this.filteredNewsItems[0] : null;
    }
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
   * Select a news item to show details and increment view count
   */
  async selectNewsItem(item: NewsItem): Promise<void> {
    this.selectedNewsItem = item;
    
    // Increment view count
    try {
      await this.incrementViewCount(item);
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Continue even if view tracking fails
    }
  }

  /**
   * Increment view count for an article
   */
  private async incrementViewCount(item: NewsItem): Promise<void> {
    // Calculate the new view count
    const newViewCount = item.viewed + 1;
    
    // Update local count immediately for better UX
    const newsItemIndex = this.allNewsItems.findIndex(news => news.id === item.id);
    if (newsItemIndex !== -1) {
      this.allNewsItems[newsItemIndex].viewed = newViewCount;
      
      // Update filtered items as well
      const filteredIndex = this.filteredNewsItems.findIndex(news => news.id === item.id);
      if (filteredIndex !== -1) {
        this.filteredNewsItems[filteredIndex].viewed = newViewCount;
      }
      
      // Update selected item
      if (this.selectedNewsItem && this.selectedNewsItem.id === item.id) {
        this.selectedNewsItem.viewed = newViewCount;
      }
    }

    // Update in Firestore with the new count
    if (item.id && !item.id.startsWith('temp_')) {
      await this.firebaseService.updateNewsArticleViews(item.id, newViewCount);
    }
    
    // Re-sort the articles to reflect the new view count
    this.applyFilters();
  }

  /**
   * Close news detail view
   */
  closeNewsDetail(): void {
    this.selectedNewsItem = null;
  }

  /**
   * Extract source name from URL
   */
  getSourceName(sourceUrl: string): string {
    if (!sourceUrl) return 'Unknown Source';
    
    try {
      const url = new URL(sourceUrl);
      const hostname = url.hostname.replace('www.', '');
      
      // Capitalize first letter of domain name
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch (error) {
      return 'Unknown Source';
    }
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