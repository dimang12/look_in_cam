import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, Params, RouterModule } from '@angular/router';
import { GoogleMap, MapInfoWindow, MapMarker, GoogleMapsModule } from '@angular/google-maps';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleMapsModule],
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap | undefined;
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow | undefined;

  subtypes = [
    { key: 'tourism', label: 'Tourism' },
    { key: 'weather', label: 'Weather' },
    { key: 'restaurant', label: 'Restaurant' },
    { key: 'crime', label: 'Crime' }
  ];

  selectedType: string | null = null;

  hasApiKey = !!environment.googleMapsApiKey;

  center: google.maps.LatLngLiteral = { lat: 11.5564, lng: 104.9282 };
  zoom = 12;
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
  };

  markers: Array<{ position: google.maps.LatLngLiteral; title: string }> = [
    { position: { lat: 11.5564, lng: 104.9282 }, title: 'Default marker' }
  ];

  selectedMarkerTitle: string | null = null;

  // track whether the Google Maps JS API has been loaded
  googleLoaded = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit(): Promise<void> {
    // ensure the Google Maps JS API is loaded before rendering the map
    if (this.hasApiKey) {
      try {
        await this.loadGoogleMapsScript();
        this.googleLoaded = true;
      } catch (e) {
        console.error('Failed to load Google Maps script', e);
        this.googleLoaded = false;
      }
    }

    this.route.params.subscribe((params: Params) => {
      const type = params['type'];
      if (type && this.subtypes.some(s => s.key === type)) {
        this.selectedType = type;
      } else {
        this.selectedType = this.subtypes[0].key;
        this.router.navigate(['/maps', this.selectedType], { replaceUrl: true });
      }
    });
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If google is already available, resolve immediately
      if ((window as any).google && (window as any).google.maps) {
        resolve();
        return;
      }

      const scriptId = 'google-maps-js-api';
      if (document.getElementById(scriptId)) {
        // script already added but not yet available; wait for load
        const existing = document.getElementById(scriptId) as HTMLScriptElement;
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (ev) => reject(ev));
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(environment.googleMapsApiKey)}`;
      script.onload = () => resolve();
      script.onerror = (ev) => reject(ev);
      document.head.appendChild(script);
    });
  }

  selectType(type: string): void {
    if (type === this.selectedType) return;
    this.router.navigate(['/maps', type]);
  }

  openInfo(marker: MapMarker, m: { title: string }) {
    this.selectedMarkerTitle = m.title;
    if (this.info) {
      this.info.open(marker);
    }
  }
}
