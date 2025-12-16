import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
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
  @HostBinding('class') hostClass = 'h-full w-full flex flex-col';
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap | undefined;
  @ViewChild(MapInfoWindow, { static: false }) info: MapInfoWindow | undefined;
  // Drawing tools
  drawingEnabled = false;
  selectedDrawMode: 'marker' | 'circle' | 'polygon' | 'polyline' | 'rectangle' = 'marker';
  private drawingManager: google.maps.drawing.DrawingManager | undefined;
  private currentDrawnOverlay: google.maps.MVCObject | null = null;
  // Icon cache and loading management
  private iconCache = new Map<string, google.maps.Icon>();
  private iconLoadingQueue = new Set<string>();
  private maxConcurrentIconLoads = 3;

  subtypes = [
    { key: 'border', label: 'ព្រំដែន' }
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

  // include type in the marker model with createdAt for filtering
  allMarkers: Array<{ position: google.maps.LatLngLiteral; title: string; type?: string; description?: string; imageUrl?: string; customIcon?: google.maps.Icon; id?: string; createdAt?: Date }> = [
    { position: { lat: 11.5564, lng: 104.9282 }, title: 'Default marker', type: 'tourism', description: 'A sample marker location', createdAt: new Date() }
  ];
  
  // Filtered markers based on date range
  markers: Array<{ position: google.maps.LatLngLiteral; title: string; type?: string; description?: string; imageUrl?: string; customIcon?: google.maps.Icon; id?: string; createdAt?: Date }> = [];

  selectedMarkerTitle: string | null = null;
  selectedMarkerType: string | null = null;
  selectedMarkerDescription: string | null = null;

  // track whether the Google Maps JS API has been loaded
  googleLoaded = false;
  mapError: string | null = null;

  // Data panel state
  dataPanelOpen = false;

  // Calendar state
  dateRangeMode: 'today' | 'week' | 'month' = 'week';
  selectedDate: Date = new Date();
  startDate: Date = new Date();
  endDate: Date = new Date();

  // Drawer/report state
  reportDrawerOpen = false;
  uploadingAttachment = false;
  uploadError: string | null = null;
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
    locationText?: string | null;
    imageUrl?: string | null;
  } = {
    lat: null,
    lng: null,
    title: '',
    type: null,
    description: null,
    crimeType: null,
    address: null,
    attachments: [],
    reportedBy: { userId: 'anonymous', name: 'Anonymous' },
    locationText: null,
    imageUrl: null
  };

  constructor(private route: ActivatedRoute, private router: Router, private firebaseService: FirebaseService, ui: UIComponentsService) { super(ui); }

  // Store custom overlays for markers with images
  private customOverlays: google.maps.OverlayView[] = [];

  async ngOnInit(): Promise<void> {
    this.updateDateRange();
    // ensure the Google Maps JS API is loaded before rendering the map
    if (this.hasApiKey) {
      try {
        await this.loadGoogleMapsScript();
        this.googleLoaded = true;
        // After maps loaded, prepare drawing library
        await this.initializeDrawingTools();
        // Load existing shapes
        await this.loadPersistedShapes();
        this.mapError = null;
      } catch (e) {
        console.error('Failed to load Google Maps script', e);
        this.googleLoaded = false;
        this.mapError = 'Failed to load Google Maps. Please check your API key configuration and ensure the Maps JavaScript API is enabled in Google Cloud Console.';
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
        const loaded = items.map(i => ({ 
          position: { lat: i.position.lat, lng: i.position.lng }, 
          title: i.title, 
          type: i.type, 
          imageUrl: i.imageUrl, 
          id: i.id,
          createdAt: i.createdAt ? (i.createdAt instanceof Date ? i.createdAt : new Date(i.createdAt.seconds * 1000)) : new Date()
        }));
        this.allMarkers = [...this.allMarkers, ...loaded];
        // Filter and display markers based on current date range
        this.filterMarkersByDateRange();
        // Icons will be loaded lazily via getMarkerIcon() when rendered
      } catch (e) {
        console.warn('Failed to load markers from Firestore', e);
      }

      try {
        const reports: CrimeReport[] = await this.firebaseService.listCrimeReports();
        if (reports && reports.length) {
          const crimeMarkers: Array<{ position: google.maps.LatLngLiteral; title: string; type: string; reportId?: string; imageUrl?: string; createdAt?: Date }> = [];
          for (const r of reports) {
            const loc = this.extractLatLngFromLocation(r.location);
            if (!loc) {
              console.warn('Skipping crime report without valid location', r?.id ?? r);
              continue;
            }
            const img = Array.isArray(r.attachments) && r.attachments.length ? r.attachments[0] : undefined;
            const createdAt = r.timestamp ? new Date(r.timestamp) : new Date();
            crimeMarkers.push({ 
              position: { lat: loc.lat, lng: loc.lng }, 
              title: r.title || r.crimeType || 'Crime reported', 
              type: 'crime', 
              reportId: r.id, 
              imageUrl: img,
              createdAt
            });
          }
          if (crimeMarkers.length) this.allMarkers = [...this.allMarkers, ...crimeMarkers];
          // Filter and display markers based on current date range
          this.filterMarkersByDateRange();
          // Icons will be loaded lazily via getMarkerIcon() when rendered
        }
      } catch (e) {
        console.warn('Failed to load crime reports from Firestore', e);
      }
    }

    // Fit all markers in view after loading
    this.fitMarkersInView();
  }

  onMapInitialized(map: google.maps.Map): void {
    // Create custom overlays for markers with images
    this.createImageOverlays(map);
  }

  private createImageOverlays(map: google.maps.Map): void {
    // Clear existing overlays
    this.customOverlays.forEach(o => o.setMap(null));
    this.customOverlays = [];

    // Create overlays for markers with imageUrl
    this.markers.filter(m => m.imageUrl).forEach(marker => {
      const overlay = this.createImageOverlay(marker, map);
      this.customOverlays.push(overlay);
    });
  }

  private createImageOverlay(marker: { position: google.maps.LatLngLiteral; imageUrl?: string; title?: string; type?: string }, map: google.maps.Map): google.maps.OverlayView {
    class CircularImageOverlay extends google.maps.OverlayView {
      private div?: HTMLDivElement;
      constructor(private pos: google.maps.LatLngLiteral, private imgUrl: string, private label: string, private markerType?: string) {
        super();
      }

      override onAdd() {
        // Use type-specific colors for border and label
        const colorMap: Record<string, string> = {
          'crime': '#ef4444',
          'border': '#ef4444',  // Red for dangerous border areas
          'tourism': '#10b981',
          'default': '#7c3aed'
        };
        const color = colorMap[this.markerType || 'default'] || colorMap['default'];
        
        this.div = document.createElement('div');
        this.div.style.position = 'absolute';
        this.div.style.cursor = 'pointer';
        this.div.innerHTML = `
          <div style="position: relative; width: 48px; height: 48px;">
            <img src="${this.imgUrl}" 
                 style="width: 48px; height: 48px; border-radius: 50%; border: 3px solid ${color}; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,0.3);" 
                 onerror="this.style.display='none'" />
            <div class="marker-label" style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; white-space: nowrap; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.2s ease;">${this.label}</div>
          </div>
        `;
        const panes = this.getPanes();
        panes?.overlayMouseTarget.appendChild(this.div);
        
        // Show label on hover
        this.div.addEventListener('mouseenter', () => {
          const label = this.div?.querySelector('.marker-label') as HTMLElement;
          if (label) label.style.opacity = '1';
        });
        this.div.addEventListener('mouseleave', () => {
          const label = this.div?.querySelector('.marker-label') as HTMLElement;
          if (label) label.style.opacity = '0';
        });
      }

      override draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        const point = projection.fromLatLngToDivPixel(new google.maps.LatLng(this.pos.lat, this.pos.lng));
        if (point) {
          this.div.style.left = (point.x - 24) + 'px';
          this.div.style.top = (point.y - 24) + 'px';
        }
      }

      override onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
      }
    }

    const overlay = new CircularImageOverlay(marker.position, marker.imageUrl!, marker.title || '', marker.type);
    overlay.setMap(map);
    return overlay;
  }

  fitMarkersInView(): void {
    if (!this.map || !this.markers || this.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    for (const marker of this.markers) {
      bounds.extend(marker.position);
    }
    this.map.fitBounds(bounds, { top: 80, right: 20, bottom: 20, left: 20 });
  }

  private async initializeDrawingTools(): Promise<void> {
    if (!this.googleLoaded) return;
    try {
      // NOTE: Drawing library is deprecated as of August 2025 and will be removed in May 2026.
      // Migration guide: https://developers.google.com/maps/deprecations
      // TODO: Replace with alternative drawing solution before May 2026
      const { DrawingManager } = await (google.maps as any).importLibrary('drawing') as google.maps.DrawingLibrary;
      if (!this.map || !this.map.googleMap) return;
      this.drawingManager = new DrawingManager({
        map: this.map.googleMap,
        drawingMode: null,
        drawingControl: false,
        circleOptions: { fillColor: '#7c3aed', fillOpacity: 0.2, strokeColor: '#7c3aed', strokeWeight: 2 },
        polygonOptions: { fillColor: '#7c3aed', fillOpacity: 0.2, strokeColor: '#7c3aed', strokeWeight: 2 },
        rectangleOptions: { fillColor: '#7c3aed', fillOpacity: 0.2, strokeColor: '#7c3aed', strokeWeight: 2 },
        polylineOptions: { strokeColor: '#7c3aed', strokeWeight: 3 }
      });

      google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (e: google.maps.drawing.OverlayCompleteEvent) => {
        this.handleOverlayComplete(e);
      });
    } catch (err) {
      console.warn('Drawing library not available. Enable Maps Drawing Library.', err);
    }
  }

  private async loadPersistedShapes(): Promise<void> {
    if (!(environment?.firebase && environment.firebase.projectId)) return;
    try {
      const shapes = await this.firebaseService.listShapes();
      if (!this.map || !this.map.googleMap) return;
      for (const s of shapes as any[]) {
        switch (s.type) {
          case 'circle':
            if (s.center && s.radius) {
              new google.maps.Circle({
                map: this.map.googleMap,
                center: s.center,
                radius: s.radius,
                fillColor: '#7c3aed', fillOpacity: 0.2, strokeColor: '#7c3aed', strokeWeight: 2
              });
            }
            break;
          case 'polygon':
            if (Array.isArray(s.path)) {
              new google.maps.Polygon({
                map: this.map.googleMap,
                paths: s.path,
                fillColor: '#7c3aed', fillOpacity: 0.2, strokeColor: '#7c3aed', strokeWeight: 2
              });
            }
            break;
          case 'polyline':
            if (Array.isArray(s.path)) {
              new google.maps.Polyline({
                map: this.map.googleMap,
                path: s.path,
                strokeColor: '#7c3aed', strokeWeight: 3
              });
            }
            break;
          case 'rectangle':
            if (Array.isArray(s.path) && s.path.length === 2) {
              const sw = s.path[0];
              const ne = s.path[1];
              new google.maps.Rectangle({
                map: this.map.googleMap,
                bounds: new google.maps.LatLngBounds(sw, ne),
                fillColor: '#7c3aed', fillOpacity: 0.2, strokeColor: '#7c3aed', strokeWeight: 2
              });
            }
            break;
        }
      }
    } catch (err) {
      console.warn('Failed to load persisted shapes', err);
    }
  }

  toggleDrawing(): void {
    this.drawingEnabled = !this.drawingEnabled;
    if (!this.drawingManager) return;
    const modeMap: Record<typeof this.selectedDrawMode, google.maps.drawing.OverlayType | null> = {
      marker: google.maps.drawing.OverlayType.MARKER,
      circle: google.maps.drawing.OverlayType.CIRCLE,
      polygon: google.maps.drawing.OverlayType.POLYGON,
      polyline: google.maps.drawing.OverlayType.POLYLINE,
      rectangle: google.maps.drawing.OverlayType.RECTANGLE
    };
    this.drawingManager.setOptions({ drawingMode: this.drawingEnabled ? modeMap[this.selectedDrawMode] : null });
  }

  setDrawMode(mode: typeof this.selectedDrawMode): void {
    this.selectedDrawMode = mode;
    if (this.drawingEnabled) this.toggleDrawing();
  }

  private handleOverlayComplete(e: google.maps.drawing.OverlayCompleteEvent): void {
    const type = e.type;
    
    // Remove previous drawn overlay if exists
    if (this.currentDrawnOverlay) {
      (this.currentDrawnOverlay as any).setMap(null);
      this.currentDrawnOverlay = null;
    }
    
    // Store the new overlay
    this.currentDrawnOverlay = e.overlay;
    
    // Do not persist immediately; only populate the report form.
    if (type === google.maps.drawing.OverlayType.MARKER) {
      const m = e.overlay as google.maps.Marker;
      const pos = m.getPosition();
      if (pos) {
        const lat = pos.lat();
        const lng = pos.lng();
        this.report.lat = lat;
        this.report.lng = lng;
        this.report.locationText = `${lat},${lng}`;
      }
    } else {
      switch (type) {
        case google.maps.drawing.OverlayType.CIRCLE: {
          const circle = e.overlay as google.maps.Circle;
          const center = circle.getCenter()?.toJSON();
          const radius = circle.getRadius();
          if (center && typeof radius === 'number') {
            // Store a readable representation into the form
            this.report.locationText = `${center.lat},${center.lng}; ${center.lat},${center.lng}`;
            // Note: radius captured internally if needed later
          }
          break;
        }
        case google.maps.drawing.OverlayType.POLYGON: {
          const poly = e.overlay as google.maps.Polygon;
          const path = poly.getPath().getArray().map(p => p.toJSON());
          this.report.locationText = path.map(p => `${p.lat},${p.lng}`).join('; ');
          break;
        }
        case google.maps.drawing.OverlayType.POLYLINE: {
          const line = e.overlay as google.maps.Polyline;
          const path = line.getPath().getArray().map(p => p.toJSON());
          this.report.locationText = path.map(p => `${p.lat},${p.lng}`).join('; ');
          break;
        }
        case google.maps.drawing.OverlayType.RECTANGLE: {
          const rect = e.overlay as google.maps.Rectangle;
          const b = rect.getBounds();
          if (b) {
            const sw = b.getSouthWest().toJSON();
            const ne = b.getNorthEast().toJSON();
            this.report.locationText = `${sw.lat},${sw.lng}; ${ne.lat},${ne.lng}`;
          }
          break;
        }
      }
      // Disable drawing after one shape (optional UX)
      this.drawingEnabled = false;
      this.drawingManager?.setOptions({ drawingMode: null });
    }
  }

  toggleDataPanel(): void {
    this.dataPanelOpen = !this.dataPanelOpen;
  }

  zoomToMarker(m: { position: google.maps.LatLngLiteral; title: string; type?: string; description?: string }): void {
    if (!this.map || !this.map.googleMap) return;
    this.map.googleMap.panTo(m.position);
    this.map.googleMap.setZoom(15);
    // Open info window for this circle
    this.openInfoForCircle(m);
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
      reportedBy: { userId: 'anonymous', name: 'Anonymous' },
      locationText: null,
      imageUrl: null
    };
  }

  closeReportDrawer(): void {
    this.reportDrawerOpen = false;
    this.closeDrawer('report-drawer');
    // Clear any drawn overlay when closing the drawer
    if (this.currentDrawnOverlay) {
      (this.currentDrawnOverlay as any).setMap(null);
      this.currentDrawnOverlay = null;
    }
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!this.reportDrawerOpen) return;
    const latLng = event.latLng;
    if (latLng) {
      const pos = latLng.toJSON();
      this.report.lat = pos.lat;
      this.report.lng = pos.lng;
      this.report.locationText = `${pos.lat},${pos.lng}`;
    }
  }

  async onAttachmentFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.uploadError = null;
    this.uploadingAttachment = true;
    try {
      const url = await this.firebaseService.uploadImage(file, 'report-attachments');
      this.report.attachments = [...this.report.attachments, url];
      this.showToast('Image uploaded', 'success', 2000);
    } catch (err) {
      console.error('Upload failed', err);
      this.uploadError = 'Upload failed. Please try again.';
      this.showToast('Upload failed', 'error', 2500);
    } finally {
      this.uploadingAttachment = false;
      input.value = '';
    }
  }

  private parseLocation(): { point?: { lat: number; lng: number }; polygon?: Array<{ lat: number; lng: number }>; rectangle?: [{ lat: number; lng: number }, { lat: number; lng: number }]; polyline?: Array<{ lat: number; lng: number }> } | null {
    const txt = (this.report.locationText || '').trim();
    if (!txt) {
      if (this.report.lat != null && this.report.lng != null) return { point: { lat: this.report.lat!, lng: this.report.lng! } };
      return null;
    }
    // Try formats: "lat,lng" OR "lat1,lng1; lat2,lng2; ..."
    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(txt)) {
      const [latStr, lngStr] = txt.split(',');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) return { point: { lat, lng } };
    }
    const parts = txt.split(';').map(p => p.trim()).filter(Boolean);
    const path: Array<{ lat: number; lng: number }> = [];
    for (const p of parts) {
      const m = p.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
      if (m) {
        const lat = parseFloat(m[1]);
        const lng = parseFloat(m[2]);
        if (!isNaN(lat) && !isNaN(lng)) path.push({ lat, lng });
      }
    }
    if (path.length >= 2) {
      // If exactly 2 points, treat as rectangle corners; else polygon/polyline
      if (path.length === 2) return { rectangle: [path[0], path[1]] } as any;
      return { polygon: path };
    }
    return null;
  }

  saveReport(): void {
    const title = this.report.title?.trim() || 'Reported location';
    const type = this.report.type || 'other';
    // Prefer first attachment as marker image for point markers; fallback to explicit imageUrl
    const attachmentUrl = (this.report.attachments && this.report.attachments[0]?.trim()) || undefined;
    const imageUrl = attachmentUrl || (this.report.imageUrl?.trim() || undefined);
    const loc = this.parseLocation();
    if (!loc) return;
    const point = loc.point;
    const createdAt = new Date();
    const newMarker = point ? { position: { lat: point.lat, lng: point.lng }, title, type, imageUrl, createdAt } : null;
    if (newMarker) {
      const isEdit = (this as any)._editIndex != null;
      if (isEdit) {
        const idx = (this as any)._editIndex as number;
        const id = (this as any)._editId as string | undefined;
        // Update in both arrays
        const allIdx = this.allMarkers.findIndex(m => m.id === id);
        if (allIdx !== -1) {
          this.allMarkers[allIdx] = { ...this.allMarkers[allIdx], ...newMarker };
        }
        this.markers[idx] = { ...this.markers[idx], ...newMarker };
        // Persist update
        if (environment?.firebase && environment.firebase.projectId && id) {
          this.firebaseService.updateMarker(id, { title, type, position: { lat: newMarker.position.lat, lng: newMarker.position.lng }, imageUrl }).catch(err => {
            console.warn('Failed to update marker in Firestore', err);
          });
        }
        // Clear edit state
        (this as any)._editIndex = null;
        (this as any)._editId = null;
      } else {
        // Add marker to allMarkers array
        const markerIndex = this.allMarkers.length;
        this.allMarkers = [
          ...this.allMarkers,
          newMarker
        ];
        
        // Filter to show in markers if within date range
        this.filterMarkersByDateRange();
        
        // Save to Firestore and get the ID
        if (environment?.firebase && environment.firebase.projectId && point) {
          this.firebaseService.addMarker({ title, type, position: { lat: point.lat, lng: point.lng }, imageUrl })
            .then(id => {
              // Update the marker with its Firestore ID in allMarkers
              this.allMarkers[markerIndex] = { ...this.allMarkers[markerIndex], id };
              // Update in markers if it's visible
              const visibleIdx = this.markers.findIndex(m => m.position.lat === newMarker.position.lat && m.position.lng === newMarker.position.lng && m.title === title);
              if (visibleIdx !== -1) {
                this.markers[visibleIdx] = { ...this.markers[visibleIdx], id };
              }
              console.log('Marker saved with ID:', id);
            })
            .catch(err => {
              console.warn('Failed to save marker to Firestore', err);
            });
        }
      }
      // Refresh image overlays
      if (this.map?.googleMap) {
        this.createImageOverlays(this.map.googleMap);
      }
    }

    // Fit all markers in view after adding new one
    this.fitMarkersInView();

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
            latitude: point ? point.lat : (this.report.lat ?? 0),
            longitude: point ? point.lng : (this.report.lng ?? 0)
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
        // For shapes (polygons, polylines, rectangles)
        if (loc.polygon) {
          this.firebaseService.addShape({ type: 'polygon', path: loc.polygon }).catch(() => {});
        } else if (loc.polyline) {
          this.firebaseService.addShape({ type: 'polyline', path: loc.polyline }).catch(() => {});
        } else if (loc.rectangle) {
          this.firebaseService.addShape({ type: 'rectangle', path: loc.rectangle as any }).catch(() => {});
        }
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

  openInfo(marker: any, m: { title: string, type?: string; description?: string }) {
    this.selectedMarkerTitle = m.title;
    this.selectedMarkerType = m.type || null;
    this.selectedMarkerDescription = m.description || null;
    if (this.info) {
      // cast at runtime to MapMarker (safe if using angular/Google Maps)
      this.info.open(marker as MapMarker);
    }
  }

  openInfoForCircle(m: { position: google.maps.LatLngLiteral; title: string; type?: string; description?: string }) {
    this.selectedMarkerTitle = m.title;
    this.selectedMarkerType = m.type || null;
    this.selectedMarkerDescription = m.description || null;
    // For circles, position the info window at the circle's center without an anchor
    if (this.info && this.map && this.map.googleMap) {
      // Set info window position and open without anchor
      this.info.position = m.position;
      this.info.open();
    }
  }

  // Edit a marker: open drawer pre-filled
  editMarker(m: { position: google.maps.LatLngLiteral; title: string; type?: string; description?: string; imageUrl?: string; id?: string }, index: number): void {
    this.reportDrawerOpen = true;
    this.openDrawer('report-drawer', { source: 'maps' });
    this.report = {
      lat: m.position.lat,
      lng: m.position.lng,
      title: m.title,
      type: m.type || null,
      description: m.description || null,
      crimeType: null,
      address: null,
      attachments: m.imageUrl ? [m.imageUrl] : [],
      reportedBy: { userId: 'anonymous', name: 'Anonymous' },
      locationText: `${m.position.lat},${m.position.lng}`,
      imageUrl: m.imageUrl || null
    } as any;
    // Store index for update
    (this as any)._editIndex = index;
    (this as any)._editId = m.id;
  }

  // Delete a marker locally and in Firestore if available
  async deleteMarker(index: number, m: { id?: string }): Promise<void> {
    console.log('Deleting marker:', { index, marker: m, hasId: !!m.id });
    
    // Remove from visible markers array
    const removed = this.markers.splice(index, 1);
    
    // Also remove from allMarkers array
    if (m.id) {
      const allIdx = this.allMarkers.findIndex(marker => marker.id === m.id);
      if (allIdx !== -1) {
        this.allMarkers.splice(allIdx, 1);
      }
    }
    
    // Delete from Firestore if it has an ID
    if (m.id) {
      try {
        console.log('Attempting to delete from Firestore with ID:', m.id);
        await this.firebaseService.deleteMarker(m.id);
        console.log('Successfully deleted from Firestore');
        this.showToast('Marker deleted', 'success', 2000);
      } catch (err) {
        console.error('Failed to delete marker from Firestore:', err);
        this.showToast('Failed to delete from database', 'error', 3000);
      }
    } else {
      console.warn('Marker has no ID, skipping Firestore deletion');
      this.showToast('Marker removed locally', 'success', 2000);
    }
    
    // Refresh image overlays to remove the deleted marker's overlay
    if (this.map?.googleMap) {
      this.createImageOverlays(this.map.googleMap);
    }
  }

  // helper for template to show a label from a subtype key
  getTypeLabel(key: string | null): string | null {
    if (!key) return null;
    const found = this.subtypes.find(s => s.key === key);
    return found ? found.label : key;
  }

  // Calendar methods
  setDateRangeMode(mode: 'today' | 'week' | 'month'): void {
    this.dateRangeMode = mode;
    this.updateDateRange();
  }

  goToPreviousPeriod(): void {
    const current = new Date(this.selectedDate);
    if (this.dateRangeMode === 'today') {
      current.setDate(current.getDate() - 1);
    } else if (this.dateRangeMode === 'week') {
      current.setDate(current.getDate() - 7);
    } else if (this.dateRangeMode === 'month') {
      current.setMonth(current.getMonth() - 1);
    }
    this.selectedDate = current;
    this.updateDateRange();
  }

  goToNextPeriod(): void {
    const current = new Date(this.selectedDate);
    if (this.dateRangeMode === 'today') {
      current.setDate(current.getDate() + 1);
    } else if (this.dateRangeMode === 'week') {
      current.setDate(current.getDate() + 7);
    } else if (this.dateRangeMode === 'month') {
      current.setMonth(current.getMonth() + 1);
    }
    this.selectedDate = current;
    this.updateDateRange();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.updateDateRange();
  }

  onDateChange(event: any): void {
    const newDate = event.value;
    if (newDate) {
      this.selectedDate = newDate;
      this.updateDateRange();
    }
  }

  private updateDateRange(): void {
    const date = new Date(this.selectedDate);
    
    if (this.dateRangeMode === 'today') {
      this.startDate = new Date(date.setHours(0, 0, 0, 0));
      this.endDate = new Date(date.setHours(23, 59, 59, 999));
    } else if (this.dateRangeMode === 'week') {
      // Get start of week (Sunday)
      const dayOfWeek = date.getDay();
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      this.startDate = startOfWeek;
      this.endDate = endOfWeek;
    } else if (this.dateRangeMode === 'month') {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      this.startDate = startOfMonth;
      this.endDate = endOfMonth;
    }
    
    console.log('Date range updated:', {
      mode: this.dateRangeMode,
      start: this.startDate,
      end: this.endDate
    });
    
    // Filter markers by date range
    this.filterMarkersByDateRange();
  }

  private filterMarkersByDateRange(): void {
    this.markers = this.allMarkers.filter(marker => {
      if (!marker.createdAt) {
        // Include markers without createdAt (legacy data)
        return true;
      }
      
      const markerDate = marker.createdAt instanceof Date ? marker.createdAt : new Date(marker.createdAt);
      const isInRange = markerDate >= this.startDate && markerDate <= this.endDate;
      
      return isInRange;
    });
    
    console.log(`Filtered markers: ${this.markers.length} of ${this.allMarkers.length} in date range`);
    
    // Refresh image overlays with filtered markers
    if (this.map?.googleMap) {
      this.createImageOverlays(this.map.googleMap);
    }
    
    // Fit markers in view
    this.fitMarkersInView();
  }

  getDateRangeLabel(): string {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    
    if (this.dateRangeMode === 'today') {
      return this.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (this.dateRangeMode === 'week') {
      const startStr = this.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = this.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    } else {
      return this.startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

  // Get circle radius based on zoom level (in meters)
  getCircleRadius(): number {
    const zoom = this.map?.googleMap?.getZoom() || this.zoom;
    // Scale radius inversely with zoom: larger circles at lower zoom
    return 50 * Math.pow(2, 14 - zoom);
  }

  // Get circle styling options based on marker data
  getCircleOptions(marker: { imageUrl?: string; type?: string }): google.maps.CircleOptions {
    // Use different colors for different types
    const colorMap: Record<string, string> = {
      'crime': '#ef4444',
      'border': '#ef4444',  // Red for dangerous border areas
      'tourism': '#10b981',
      'default': '#7c3aed'
    };
    const color = colorMap[marker.type || 'default'] || colorMap['default'];
    
    // Make circle more subtle when there's an image overlay
    if (marker.imageUrl) {
      return {
        strokeColor: color,
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.1,
        clickable: true,
        draggable: false
      };
    }
    
    return {
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35,
      clickable: true,
      draggable: false
    };
  }

  // Generate a circular icon with border from an image URL
  async createCircularIcon(imageUrl: string, size = 48, borderColor = '#7c3aed', borderWidth = 4): Promise<google.maps.Icon> {
    try {
      // Fetch image as blob to avoid CORS issues
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      return new Promise<google.maps.Icon>((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = size * 2; // high DPI for crisper icon
        canvas.height = size * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context not available')); return; }

        const radius = size - 2;
        const center = size;

        // Draw outer border
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth * 2; // account for double DPI
        ctx.stroke();

        // Clip inner circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius - borderWidth * 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const img = new Image();
        img.onload = () => {
          // Draw image covering the inner circle
          ctx.drawImage(img, borderWidth * 2, borderWidth * 2, size * 2 - borderWidth * 4, size * 2 - borderWidth * 4);
          ctx.restore();
          const url = canvas.toDataURL('image/png');
          // Clean up object URL
          URL.revokeObjectURL(objectUrl);
          resolve({
            url,
            scaledSize: new google.maps.Size(size, size),
            anchor: new google.maps.Point(size / 2, size),
            labelOrigin: new google.maps.Point(size / 2, -10)
          });
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(objectUrl);
          reject(e);
        };
        img.src = objectUrl;
      });
    } catch (err) {
      console.error('Failed to fetch image for icon generation:', err);
      throw err;
    }
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
