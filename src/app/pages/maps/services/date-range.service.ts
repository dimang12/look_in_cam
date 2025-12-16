import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateRangeService {
  
  calculateDateRange(
    selectedDate: Date,
    mode: 'today' | 'week' | 'month'
  ): { startDate: Date; endDate: Date } {
    const date = new Date(selectedDate);
    
    if (mode === 'today') {
      const startDate = new Date(date.setHours(0, 0, 0, 0));
      const endDate = new Date(date.setHours(23, 59, 59, 999));
      return { startDate, endDate };
    } else if (mode === 'week') {
      const dayOfWeek = date.getDay();
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return { startDate: startOfWeek, endDate: endOfWeek };
    } else {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      return { startDate: startOfMonth, endDate: endOfMonth };
    }
  }

  getNextPeriod(currentDate: Date, mode: 'today' | 'week' | 'month'): Date {
    const date = new Date(currentDate);
    if (mode === 'today') {
      date.setDate(date.getDate() + 1);
    } else if (mode === 'week') {
      date.setDate(date.getDate() + 7);
    } else if (mode === 'month') {
      date.setMonth(date.getMonth() + 1);
    }
    return date;
  }

  getPreviousPeriod(currentDate: Date, mode: 'today' | 'week' | 'month'): Date {
    const date = new Date(currentDate);
    if (mode === 'today') {
      date.setDate(date.getDate() - 1);
    } else if (mode === 'week') {
      date.setDate(date.getDate() - 7);
    } else if (mode === 'month') {
      date.setMonth(date.getMonth() - 1);
    }
    return date;
  }

  formatDateRangeLabel(startDate: Date, endDate: Date, mode: 'today' | 'week' | 'month'): string {
    if (mode === 'today') {
      return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (mode === 'week') {
      const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    } else {
      return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }
}
