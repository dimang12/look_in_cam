import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

export type DateRangeMode = 'today' | 'week' | 'month';

@Component({
  selector: 'app-calendar-controls',
  templateUrl: './calendar-controls.component.html',
  styleUrls: ['./calendar-controls.component.css']
})
export class CalendarControlsComponent {
  @Input() dateRangeMode: DateRangeMode = 'week';
  @Input() selectedDate: Date = new Date();
  @Input() dateRangeLabel: string = '';

  @Output() dateRangeModeChange = new EventEmitter<DateRangeMode>();
  @Output() selectedDateChange = new EventEmitter<Date>();
  @Output() previousPeriod = new EventEmitter<void>();
  @Output() nextPeriod = new EventEmitter<void>();

  /**
   * Handle date range mode selection change
   */
  setDateRangeMode(mode: DateRangeMode): void {
    this.dateRangeMode = mode;
    this.dateRangeModeChange.emit(mode);
  }

  /**
   * Handle date picker change
   */
  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this.selectedDate = event.value;
      this.selectedDateChange.emit(event.value);
    }
  }

  /**
   * Go to previous period
   */
  goToPreviousPeriod(): void {
    this.previousPeriod.emit();
  }

  /**
   * Go to next period
   */
  goToNextPeriod(): void {
    this.nextPeriod.emit();
  }
}