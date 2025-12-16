import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapOverlayService {
  
  createCircularImageOverlay(
    marker: { position: google.maps.LatLngLiteral; imageUrl?: string; title?: string; type?: string },
    map: google.maps.Map
  ): google.maps.OverlayView {
    class CircularImageOverlay extends google.maps.OverlayView {
      private div?: HTMLDivElement;
      
      constructor(
        private pos: google.maps.LatLngLiteral,
        private imgUrl: string,
        private label: string,
        private markerType?: string
      ) {
        super();
      }

      override onAdd() {
        const colorMap: Record<string, string> = {
          'crime': '#ef4444',
          'border': '#ef4444',
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
        if (this.div) {
          this.div.parentNode?.removeChild(this.div);
          this.div = undefined;
        }
      }
    }

    if (!marker.imageUrl) {
      throw new Error('Marker must have an imageUrl');
    }

    const overlay = new CircularImageOverlay(
      marker.position,
      marker.imageUrl,
      marker.title || '',
      marker.type
    );
    overlay.setMap(map);
    return overlay;
  }

  clearOverlays(overlays: google.maps.OverlayView[]): void {
    overlays.forEach(overlay => overlay.setMap(null));
  }

  createImageOverlays(
    markers: Array<{ position: google.maps.LatLngLiteral; imageUrl?: string; title?: string; type?: string }>,
    map: google.maps.Map
  ): google.maps.OverlayView[] {
    const overlays: google.maps.OverlayView[] = [];
    
    markers.forEach(marker => {
      if (marker.imageUrl) {
        try {
          const overlay = this.createCircularImageOverlay(marker, map);
          overlays.push(overlay);
        } catch (err) {
          console.warn('Failed to create overlay for marker:', marker, err);
        }
      }
    });
    
    return overlays;
  }
}
