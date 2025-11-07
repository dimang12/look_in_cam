import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    AppRoutingModule,
    GoogleMapsModule
  ],
  providers: [
    // If you want to auto-load the Google Maps JS API at bootstrap, you can add a script tag
    // to `index.html` that includes your API key, or use a provider pattern supported by
    // your @angular/google-maps version. The direct `provideGoogleMaps` symbol isn't
    // exported by v17 of @angular/google-maps, so we import the module instead.
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
