# Installation Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn

## Step 1: Fix npm Cache Permissions (if needed)

If you encounter permission errors like `EACCES` or `EEXIST`, fix the npm cache permissions:

```bash
sudo chown -R $(whoami) ~/.npm
```

## Step 2: Install Dependencies

Run one of these commands:

```bash
# Recommended: Use legacy peer deps
npm install --legacy-peer-deps

# Alternative: Force install (may cause issues)
npm install --force
```

## Step 3: Copy Assets

Copy all assets from the original template to the Angular assets folder:

```bash
cp -r "Vyzor - Django Bootstrap 5 Premium Admin & Dashboard Template_files"/* src/assets/
```

## Step 4: Run the Application

```bash
npm start
```

The application will be available at `http://localhost:4200`

## Troubleshooting

### Issue: npm cache permission errors
**Solution**: Run `sudo chown -R $(whoami) ~/.npm`

### Issue: Peer dependency conflicts
**Solution**: Use `npm install --legacy-peer-deps` instead of `npm install`

### Issue: ng-apexcharts incompatible
**Solution**: We've removed `ng-apexcharts` from dependencies. You can:
- Use ApexCharts directly (already included)
- Wait for ng-apexcharts to support Angular 17
- Upgrade to Angular 20+ if you need ng-apexcharts

## Notes

- The `ng-apexcharts` package was removed because it requires Angular 20+, but this project uses Angular 17
- You can still use ApexCharts directly without the Angular wrapper
- All Bootstrap 5 functionality is included and working

