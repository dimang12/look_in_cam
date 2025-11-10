import { OnDestroy, Directive } from '@angular/core';
import { Subject } from 'rxjs';
import { UIComponentsService } from './ui-components.service';
import {ToastLevel, ConfirmOptions, DrawerState } from './ui-components.model';

/**
 * Base class to extend from in UI-heavy components.
 * Provides convenience wrappers around UIComponentsService and a destroy$ Subject for subscriptions.
 *
 * Usage:
 *
 * export class MyComponent extends UIComponentBase implements OnInit {
 *   constructor(ui: UIComponentsService) { super(ui); }
 * }
 */
@Directive()
export abstract class UIComponentBase implements OnDestroy {
  protected destroy$ = new Subject<void>();

  constructor(protected ui: UIComponentsService) {}

  // Toast helpers
  protected showToast(message: string, level: ToastLevel = 'info', durationMs?: number): string {
    return this.ui.showToast(message, level, durationMs);
  }

  protected dismissToast(id: string): void {
    this.ui.dismissToast(id);
  }

  protected toasts$() {
    return this.ui.toasts();
  }

  // Loading
  protected showLoading(): void {
    this.ui.showLoading();
  }

  protected hideLoading(): void {
    this.ui.hideLoading();
  }

  protected isLoading$() {
    return this.ui.isLoading();
  }

  // Drawers
  protected openDrawer(id: string, payload?: any): void {
    this.ui.openDrawer(id, payload);
  }

  protected closeDrawer(id: string): void {
    this.ui.closeDrawer(id);
  }

  protected getDrawerState(id: string) {
    return this.ui.getDrawerState(id);
  }

  // Confirm
  protected confirm(opts: ConfirmOptions): Promise<boolean> {
    return this.ui.confirm(opts);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
