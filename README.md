# Vyzor Angular Admin Dashboard

This is an Angular conversion of the Vyzor Bootstrap 5 Premium Admin & Dashboard Template.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (v17 or higher)

## Installation

1. **Fix npm cache permissions** (if you encounter permission errors):
```bash
sudo chown -R $(whoami) ~/.npm
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag is used to avoid peer dependency conflicts. If you prefer, you can also use `npm install --force`, but `--legacy-peer-deps` is generally safer.

## Development

Run the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Build for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── layout/          # Layout components (header, sidebar, footer)
│   ├── pages/           # Page components
│   │   └── dashboard/   # Dashboard page
│   ├── app.component.*  # Root component
│   ├── app.module.ts    # Root module
│   └── app-routing.module.ts  # Routing configuration
├── assets/              # Static assets (images, styles, js)
└── styles.css           # Global styles
```

## Features

- ✅ Angular 17+ with standalone-ready architecture
- ✅ Bootstrap 5 integration
- ✅ Responsive layout with sidebar navigation
- ✅ Dashboard with cards and charts
- ✅ Component-based architecture

## Next Steps

1. Copy all CSS, JS, and image files from the original template's `_files` folder to `src/assets/`
2. Integrate ApexCharts for dashboard charts
3. Add more pages and routes as needed
4. Customize the sidebar menu items
5. Add authentication and routing guards if needed

## Notes

- The original HTML template's assets need to be copied to `src/assets/` directory
- CSS files from the template should be placed in `src/assets/styles/`
- JavaScript files should be placed in `src/assets/js/`
- Images should be placed in `src/assets/images/`

## License

This project is based on the Vyzor template by Spruko Technologies.

