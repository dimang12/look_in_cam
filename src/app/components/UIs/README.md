UIComponentsService

This tiny service centralizes small UI primitives used across the app:
- toasts (show/dismiss)
- a loading counter (show/hide)
- drawers (open/close/get state)
- confirm (simple wrapper)

Usage:

1. Inject in a component:

```ts
constructor(private ui: UIComponentsService) {}
```

2. Show a toast:

```ts
this.ui.showToast('Saved', 'success', 3000);
```

3. Show a full-screen loading indicator:

```ts
this.ui.showLoading();
// do async work
this.ui.hideLoading();
```

4. Open/close a named drawer:

```ts
this.ui.openDrawer('report-drawer', { some: 'payload' });
this.ui.closeDrawer('report-drawer');
```

Notes:
- This is intentionally lightweight and does not ship UI elements. Add a top-level component (e.g. `AppToastsComponent`, `AppLoadingOverlay`) that subscribes to `ui.state` and renders the actual elements.
- The service currently uses window.confirm for `confirm()` — replace with a modal UI for a consistent UX.

