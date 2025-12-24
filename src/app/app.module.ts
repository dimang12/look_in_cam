import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { AppLoadingOverlayComponent } from './components/UIs/app-loading-overlay.component';
import { ButtonComponent } from './components/UIs/basisUIs/button/button.component';
import { MapsComponent } from './pages/maps/maps.component';
import { MapTypeTabsComponent } from './pages/maps/components/map-type/map-type-tabs.component';
import { SubmenuComponent } from './layout/submenu/submenu.component';
import { PoliticsComponent } from './pages/politics/politics.component';
import { CalendarControlsComponent } from './components/calendar-controls/calendar-controls.component';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClientModule } from '@angular/common/http';

// Firebase: use the modular SDK directly (avoid @angular/fire if its published versions mismatch)
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';

// Initialize Firebase app (modular SDK)
if (environment?.firebase && environment.firebase.projectId) {
  initializeApp(environment.firebase);
} else {
  console.warn('Firebase not initialized: environment.firebase is not configured or missing.');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DashboardComponent,
    MapsComponent,
    SubmenuComponent,
    AppLoadingOverlayComponent,
    ButtonComponent,
    MapTypeTabsComponent,
    PoliticsComponent,
    CalendarControlsComponent,
    // ButtonComponent is standalone; import it where needed in standalone components.
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HttpClientModule,
    AppRoutingModule,
    GoogleMapsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MarkdownModule.forRoot(),
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
