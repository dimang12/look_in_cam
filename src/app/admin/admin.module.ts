import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

// Quill Rich Text Editor
import { QuillModule } from 'ngx-quill';

// Admin Components
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { ContentManagementComponent } from './components/content-management/content-management.component';
import { NewsArticlesComponent } from './components/news-articles/news-articles.component';
import { NewsArticleFormComponent } from './components/news-article-form/news-article-form.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminHeaderComponent } from './components/admin-header/admin-header.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { UserDialogComponent } from './components/user-dialog/user-dialog.component';
import { ContentDialogComponent } from './components/content-dialog/content-dialog.component';
import { NewsArticleDetailComponent } from './components/news-article-detail/news-article-detail.component';

// Admin Services
import { AdminAuthService } from './services/admin-auth.service';
import { NewsArticleService } from './services/news-article.service';

// Admin Guards
import { AdminGuard } from './guards/admin.guard';

// Routing
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminDashboardComponent,
    UserManagementComponent,
    ContentManagementComponent,
    NewsArticlesComponent,
    NewsArticleFormComponent,
    SettingsComponent,
    AdminLoginComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    UserDialogComponent,
    ContentDialogComponent
    ,NewsArticleDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    
    // Material Modules
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTooltipModule,
    QuillModule.forRoot()
  ],
  providers: [
    AdminAuthService,
    NewsArticleService,
    AdminGuard
  ]
})
export class AdminModule { }