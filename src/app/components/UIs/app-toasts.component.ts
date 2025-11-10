import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UIComponentsService } from './ui-components.service';
import { Toast } from './ui-components.model';

@Component({
  selector: 'app-toasts',
  templateUrl: './app-toasts.component.html',
  styleUrls: ['./app-toasts.component.css']
})
export class AppToastsComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub: Subscription | null = null;

  constructor(private ui: UIComponentsService) {}

  ngOnInit(): void {
    this.sub = this.ui.toasts().subscribe(t => this.toasts = t.slice());
  }

  dismiss(id: string) {
    this.ui.dismissToast(id);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

