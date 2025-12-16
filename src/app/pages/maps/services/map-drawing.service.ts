import { Injectable } from '@angular/core';

export interface DrawingState {
  drawingEnabled: boolean;
  selectedDrawMode: 'marker' | 'circle' | 'polygon' | 'polyline' | 'rectangle';
  drawingManager?: google.maps.drawing.DrawingManager;
  currentDrawnOverlay: google.maps.MVCObject | null;
}

@Injectable({
  providedIn: 'root'
})
export class MapDrawingService {
  
  async initializeDrawingTools(map: google.maps.Map): Promise<google.maps.drawing.DrawingManager> {
    try {
      const { DrawingManager } = await google.maps.importLibrary('drawing') as google.maps.DrawingLibrary;
      
      const drawingManager = new DrawingManager({
        drawingMode: null,
        drawingControl: false,
        markerOptions: {
          draggable: false,
        },
        circleOptions: {
          fillColor: '#7c3aed',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#7c3aed',
          clickable: false,
          editable: true,
          zIndex: 1
        },
        polygonOptions: {
          fillColor: '#7c3aed',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#7c3aed',
          clickable: false,
          editable: true,
          zIndex: 1
        },
        polylineOptions: {
          strokeColor: '#7c3aed',
          strokeWeight: 3,
          clickable: false,
          editable: true,
          zIndex: 1
        },
        rectangleOptions: {
          fillColor: '#7c3aed',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#7c3aed',
          clickable: false,
          editable: true,
          zIndex: 1
        }
      });
      
      drawingManager.setMap(map);
      return drawingManager;
    } catch (err) {
      console.error('Failed to initialize drawing tools:', err);
      throw err;
    }
  }

  setDrawingMode(
    manager: google.maps.drawing.DrawingManager,
    mode: 'marker' | 'circle' | 'polygon' | 'polyline' | 'rectangle'
  ): void {
    const modeMap: Record<string, google.maps.drawing.OverlayType | null> = {
      marker: google.maps.drawing.OverlayType.MARKER,
      circle: google.maps.drawing.OverlayType.CIRCLE,
      polygon: google.maps.drawing.OverlayType.POLYGON,
      polyline: google.maps.drawing.OverlayType.POLYLINE,
      rectangle: google.maps.drawing.OverlayType.RECTANGLE
    };
    manager.setDrawingMode(modeMap[mode] || null);
  }

  enableDrawing(manager: google.maps.drawing.DrawingManager, mode: google.maps.drawing.OverlayType | null): void {
    manager.setDrawingMode(mode);
  }

  disableDrawing(manager: google.maps.drawing.DrawingManager): void {
    manager.setDrawingMode(null);
  }

  removeOverlay(overlay: google.maps.MVCObject | null): void {
    if (overlay && 'setMap' in overlay) {
      (overlay as any).setMap(null);
    }
  }
}
