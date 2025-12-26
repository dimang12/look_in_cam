import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { ContentManagementComponent } from './components/content-management/content-management.component';
import { NewsArticlesComponent } from './components/news-articles/news-articles.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminGuard } from './guards/admin.guard';
import { NewsArticleDetailComponent } from './components/news-article-detail/news-article-detail.component';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/admin/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: AdminLoginComponent 
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'users',
        component: UserManagementComponent
      },
      {
        path: 'content',
        component: ContentManagementComponent
      },
      {
        path: 'news',
        component: NewsArticlesComponent
      },
      {
        path: 'news/:id',
        component: NewsArticleDetailComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }