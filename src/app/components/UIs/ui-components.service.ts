import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Toast, ToastLevel, ConfirmOptions, DrawerState, UIState } from './ui-components.model';

@Injectable({ providedIn: 'root' })
export class UIComponentsService {
  private state$ = new BehaviorSubject<UIState>({ toasts: [], loadingCount: 0, drawers: [] });

  state = this.state$.asObservable();

  private genId(prefix = ''): string {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  // Toasts
  toasts(): Observable<Toast[]> {
    return this.state$.pipe(map(s => s.toasts));
  }

  showToast(message: string, level: ToastLevel = 'info', durationMs?: number) {
    const id = this.genId('t_');
    const t: Toast = { id, message, level, durationMs };
    const s = this.state$.value;
    const next = { ...s, toasts: [...s.toasts, t] };
    this.state$.next(next);
    if (durationMs && durationMs > 0) {
      setTimeout(() => this.dismissToast(id), durationMs);
    }
    return id;
  }

  dismissToast(id: string) {
    const s = this.state$.value;
    const next = { ...s, toasts: s.toasts.filter(t => t.id !== id) };
    this.state$.next(next);
  }

  // Loading indicator
  showLoading() {
    const s = this.state$.value;
    const next = { ...s, loadingCount: (s.loadingCount || 0) + 1 };
    this.state$.next(next);
  }

  hideLoading() {
    const s = this.state$.value;
    const next = { ...s, loadingCount: Math.max(0, (s.loadingCount || 0) - 1) };
    this.state$.next(next);
  }

  isLoading(): Observable<boolean> {
    return this.state$.pipe(map(s => (s.loadingCount || 0) > 0));
  }

  // Drawers
  openDrawer(id: string, payload?: any) {
    const s = this.state$.value;
    const existingIdx = s.drawers.findIndex(d => d.id === id);
    let drawers: DrawerState[];
    if (existingIdx >= 0) {
      drawers = s.drawers.map(d => d.id === id ? { ...d, open: true, payload } : d);
    } else {
      drawers = [...s.drawers, { id, open: true, payload }];
    }
    this.state$.next({ ...s, drawers });
  }

  closeDrawer(id: string) {
    const s = this.state$.value;
    const drawers = s.drawers.map(d => d.id === id ? { ...d, open: false } : d);
    this.state$.next({ ...s, drawers });
  }

  getDrawerState(id: string): Observable<DrawerState | undefined> {
    return this.state$.pipe(map(s => s.drawers.find(d => d.id === id)));
  }

  // Confirm — small helper that returns a Promise resolved by the consumer UI (not implemented here)
  confirm(_opts: ConfirmOptions): Promise<boolean> {
    // For now, fallback to window.confirm to keep it synchronous and immediate
    return Promise.resolve(window.confirm((_opts.title ? _opts.title + '\n' : '') + _opts.message));
  }
}
