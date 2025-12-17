import { Component, OnInit } from '@angular/core';
import { DateRangeMode } from '../../components/calendar-controls/calendar-controls.component';

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
  allNewsItems: NewsItem[] = [
    {
      id: '1',
      title: 'សភាជាតិបានអនុម័តច្បាប់ថ្មីស្តីពីការបោះឆ្នោត',
      summary: 'សភាជាតិបានអនុម័តច្បាប់ថ្មីមួយដែលនឹងផ្លាស់ប្តូរវិធីសាស្រ្តបោះឆ្នោត',
      content: 'នេះជាមាតិកាលម្អិតនៃការអនុម័តច្បាប់ថ្មីស្តីពីការបោះឆ្នោត។ ច្បាប់នេះនឹងមានប្រសិទ្ធភាពចាប់ពីឆ្នាំ២០២៦។ វាបានកំណត់នូវវិធីសាស្រ្តថ្មីសម្រាប់ការបោះឆ្នោតជាតិ និងការបោះឆ្នោតក្នុងស្រុក។',
      publishedDate: new Date('2025-12-15'),
      source: 'Cambodia News Network',
      category: 'រដ្ឋាភិបាល'
    },
    {
      id: '2',
      title: 'នាយករដ្ឋមន្ត្រីបានជួបជាមួយប្រតិភូអន្តរជាតិ',
      summary: 'កិច្ចប្រជុំដ៏សំខាន់មួយបានធ្វើឡើងនៅវិមានសន្តិភាព',
      content: 'នាយករដ្ឋមន្ត្រីបានធ្វើកិច្ចប្រជុំជាមួយប្រតិភូអន្តរជាតិ ដើម្បីពិភាក្សាអំពីសហការភាពក្នុងតំបន់។ កិច្ចប្រជុំនេះបានផ្តោតលើការអភិវឌ្ឍន៍សេដ្ឋកិច្ច និងការធានាសន្តិភាពក្នុងតំបន់។',
      publishedDate: new Date('2025-12-14'),
      source: 'National Press Agency',
      category: 'អន្តរជាតិ'
    },
    {
      id: '3',
      title: 'គណៈកម្មការថ្មីត្រូវបានបង្កើតឡើង',
      summary: 'គណៈកម្មការសម្រាប់ការកែទម្រង់រដ្ឋបាលត្រូវបានបង្កើតឡើង',
      content: 'រដ្ឋាភិបាលបានប្រកាសបង្កើតគណៈកម្មការថ្មីមួយដើម្បីធ្វើការកែទម្រង់រដ្ឋបាលសាធារណៈ។ គណៈកម្មការនេះនឹងទទួលបន្ទុកក្នុងការធ្វើឱ្យប្រសើរឡើងនូវប្រសិទ្ធភាពនៃសេវាកម្មសាធារណៈ។',
      publishedDate: new Date('2025-12-13'),
      source: 'Government Herald',
      category: 'រដ្ឋាភិបាល'
    }
  ];

  filteredNewsItems: NewsItem[] = [];
  selectedNewsItem: NewsItem | null = null;

  ngOnInit(): void {
    this.applyFilters();
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