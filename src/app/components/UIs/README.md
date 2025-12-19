UIComponentsService

This tiny service centralizes small UI primitives used across the app:
- a loading counter (show/hide)
- drawers (open/close/get state)
- confirm (simple wrapper)

Note: Toast functionality has been removed. Messages are now logged to console instead.

Usage:

1. Inject in a component:

```ts
constructor(private ui: UIComponentsService) {}
```

2. Log a message (toast functionality removed):

```ts
// Instead of showing toast, messages are logged to console
console.log('Saved successfully');
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

