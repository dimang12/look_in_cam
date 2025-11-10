import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { environment } from '../../../environments/environment';
import { FirebaseService } from '../../services/firebase.service';
import type { CrimeReport } from '../../services/firebase.service';
import { UIComponentBase } from '../../components/UIs/ui-components.base';
import { UIComponentsService } from '../../components/UIs/ui-components.service';

@Component({
  selector: 'app-maps',
  // Not standalone: declared in AppModule, so it can use components declared there
  // keep template and styles
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent extends UIComponentBase implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap | undefined;
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow | undefined;

  subtypes = [
    { key: 'tourism', label: 'Tourism' },
    { key: 'weather', label: 'Weather' },
    { key: 'restaurant', label: 'Restaurant' },
    { key: 'crime', label: 'Crime' }
  ];

  selectedType: string | null = null;

  // Use optional chaining to avoid runtime errors if `environment` is undefined
  hasApiKey = !!environment?.googleMapsApiKey;

  center: google.maps.LatLngLiteral = { lat: 11.5564, lng: 104.9282 };
  zoom = 12;
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
  };

  // include type in the marker model
  markers: Array<{ position: google.maps.LatLngLiteral; title: string; type?: string }> = [
    { position: { lat: 11.5564, lng: 104.9282 }, title: 'Default marker', type: 'tourism' }
  ];

  selectedMarkerTitle: string | null = null;
  selectedMarkerType: string | null = null;

  // track whether the Google Maps JS API has been loaded
  googleLoaded = false;

  // Drawer/report state
  reportDrawerOpen = false;
  // Extend the report model to handle crime reports and attachments
  report: {
    lat: number | null;
    lng: number | null;
    title: string;
    type?: string | null;
    // crime-specific
    description?: string | null;
    crimeType?: string | null;
    address?: string | null;
    attachments: string[];
    reportedBy: { userId: string; name: string };
  } = {
    lat: null,
    lng: null,
    title: '',
    type: null,
    description: null,
    crimeType: null,
    address: null,
    attachments: [],
    reportedBy: { userId: 'anonymous', name: 'Anonymous' }
  };

  constructor(private route: ActivatedRoute, private router: Router, private firebaseService: FirebaseService, ui: UIComponentsService) { super(ui); }

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

    // If Firebase is configured, load persisted markers and crime reports
    if (environment?.firebase && environment.firebase.projectId) {
      try {
        const items = await this.firebaseService.listMarkers();
        this.markers = [
          ...this.markers,
          ...items.map(i => ({ position: { lat: i.position.lat, lng: i.position.lng }, title: i.title, type: i.type }))
        ];
      } catch (e) {
        console.warn('Failed to load markers from Firestore', e);
      }

      try {
        const reports: CrimeReport[] = await this.firebaseService.listCrimeReports();
        if (reports && reports.length) {
          const crimeMarkers: Array<{ position: google.maps.LatLngLiteral; title: string; type: string; reportId?: string }> = [];
          for (const r of reports) {
            const loc = this.extractLatLngFromLocation(r.location);
            if (!loc) {
              console.warn('Skipping crime report without valid location', r?.id ?? r);
              continue;
            }
            crimeMarkers.push({ position: { lat: loc.lat, lng: loc.lng }, title: r.title || r.crimeType || 'Crime reported', type: 'crime', reportId: r.id });
          }
          if (crimeMarkers.length) this.markers = [...this.markers, ...crimeMarkers];
        }
      } catch (e) {
        console.warn('Failed to load crime reports from Firestore', e);
      }
    }
  }

  addReportMarker(): void {
    // Open the drawer and prepare a fresh report object
    this.reportDrawerOpen = true;
    this.openDrawer('report-drawer', { source: 'maps' });
    this.report = {
      lat: null,
      lng: null,
      title: '',
      type: this.selectedType || this.subtypes[0].key,
      description: null,
      crimeType: null,
      address: null,
      attachments: [],
      reportedBy: { userId: 'anonymous', name: 'Anonymous' }
    };
  }

  closeReportDrawer(): void {
    this.reportDrawerOpen = false;
    this.closeDrawer('report-drawer');
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!this.reportDrawerOpen) return;
    const latLng = event.latLng;
    if (latLng) {
      const pos = latLng.toJSON();
      this.report.lat = pos.lat;
      this.report.lng = pos.lng;
    }
  }

  saveReport(): void {
    // removed debugger
    if (this.report.lat == null || this.report.lng == null) return;
    const title = this.report.title?.trim() || 'Reported location';
    const type = this.report.type || 'other';
    const newMarker = { position: { lat: this.report.lat, lng: this.report.lng }, title, type };
    this.markers = [
      ...this.markers,
      newMarker
    ];
    // Persist to Firestore if available
    if (environment?.firebase && environment.firebase.projectId) {
      // If the report is a crime type, write to `crimeReports` with the requested JSON structure
      if (type === 'crime') {
        const crimePayload = {
          title: title,
          description: this.report.description || '',
          crimeType: this.report.crimeType || 'Unknown',
          timestamp: Date.now(),
          location: {
            latitude: this.report.lat!,
            longitude: this.report.lng!
          },
          address: this.report.address || '',
          reportedBy: this.report.reportedBy || { userId: 'anonymous', name: 'Anonymous' },
          status: 'Pending Investigation',
          attachments: this.report.attachments || []
        };

        this.firebaseService.addCrimeReport(crimePayload).catch(err => {
          console.warn('Failed to save crime report to Firestore', err);
        });
      } else {
        // generic marker
        this.firebaseService.addMarker({ title, type, position: { lat: this.report.lat, lng: this.report.lng } }).catch(err => {
          console.warn('Failed to save marker to Firestore', err);
        });
      }
    }

    this.showToast('Report saved', 'success', 3000);
    this.closeReportDrawer();
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If Google is already available, resolve immediately
      if ((window as any).google && (window as any).google.maps) {
        resolve();
        return;
      }

      const scriptId = 'google-maps-js-api';
      if (document.getElementById(scriptId)) {
        // script already added but not yet available; wait for a load
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
      // Use optional chaining so we don't try to access a property on undefined
      const key = environment?.googleMapsApiKey || '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
      script.onload = () => resolve();
      script.onerror = (ev) => reject(ev);
      document.head.appendChild(script);
    });
  }

  selectType(type: string): void {
    if (type === this.selectedType) return;
    this.router.navigate(['/maps', type]);
  }

  openInfo(marker: any, m: { title: string, type?: string }) {
    this.selectedMarkerTitle = m.title;
    this.selectedMarkerType = m.type || null;
    if (this.info) {
      // cast at runtime to MapMarker (safe if using angular/Google Maps)
      this.info.open(marker as MapMarker);
    }
  }

  // helper for template to show a label from a subtype key
  getTypeLabel(key: string | null): string | null {
    if (!key) return null;
    const found = this.subtypes.find(s => s.key === key);
    return found ? found.label : key;
  }

  // Robust extractor that accepts multiple shapes for the stored location object
  private extractLatLngFromLocation(location: any): { lat: number; lng: number } | null {
    if (!location) return null;
    // Common shapes:
    // { latitude: number, longitude: number }
    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      return { lat: location.latitude, lng: location.longitude };
    }
    // { lat: number, lng: number }
    if (typeof location.lat === 'number' && typeof location.lng === 'number') {
      return { lat: location.lat, lng: location.lng };
    }
    // Firestore GeoPoint may sometimes appear with _lat/_long or as an object with toJSON
    if (typeof location._lat === 'number' && typeof location._long === 'number') {
      return { lat: location._lat, lng: location._long };
    }
    // If it's a GeoPoint-like object with getters
    try {
      if (typeof (location as any).latitude === 'function' && typeof (location as any).longitude === 'function') {
        const lat = (location as any).latitude();
        const lng = (location as any).longitude();
        if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
      }
    } catch {
      // ignore
    }
    // As last resort, check nested property e.g. { location: { lat: ..., lng: ... } }
    if (location.location) return this.extractLatLngFromLocation(location.location);
    return null;
  }
}
