import { Injectable } from '@angular/core';

export interface LocationParseResult {
  point?: { lat: number; lng: number };
  polygon?: Array<{ lat: number; lng: number }>;
  polyline?: Array<{ lat: number; lng: number }>;
  rectangle?: Array<{ lat: number; lng: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class LocationParserService {
  
  parseLocation(locationText: string | null): LocationParseResult | null {
    if (!locationText) return null;
    
    const trimmed = locationText.trim();
    
    // Try point format: lat, lng
    const pointMatch = trimmed.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (pointMatch) {
      const lat = parseFloat(pointMatch[1]);
      const lng = parseFloat(pointMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { point: { lat, lng } };
      }
    }
    
    // Try polygon/polyline/rectangle format: multiple lat,lng pairs
    const coordsMatch = trimmed.match(/(-?\d+\.?\d*\s*,\s*-?\d+\.?\d*)/g);
    if (coordsMatch && coordsMatch.length >= 2) {
      const path: Array<{ lat: number; lng: number }> = [];
      for (const coord of coordsMatch) {
        const [latStr, lngStr] = coord.split(',').map(s => s.trim());
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (!isNaN(lat) && !isNaN(lng)) {
          path.push({ lat, lng });
        }
      }
      
      if (path.length >= 3) {
        // Check if it's a rectangle (4 points forming a rectangle)
        if (path.length === 4 && this.isRectangle(path)) {
          return { rectangle: path };
        }
        // Check if first and last points are the same (closed polygon)
        const first = path[0];
        const last = path[path.length - 1];
        if (Math.abs(first.lat - last.lat) < 0.0001 && Math.abs(first.lng - last.lng) < 0.0001) {
          return { polygon: path };
        }
        // Otherwise it's a polyline
        return { polyline: path };
      } else if (path.length === 2) {
        return { polyline: path };
      }
    }
    
    return null;
  }

  private isRectangle(points: Array<{ lat: number; lng: number }>): boolean {
    if (points.length !== 4) return false;
    
    // Check if points form a rectangle by verifying:
    // 1. Opposite sides are parallel and equal
    // 2. All angles are 90 degrees (approximately)
    
    const lats = points.map(p => p.lat).sort((a, b) => a - b);
    const lngs = points.map(p => p.lng).sort((a, b) => a - b);
    
    // Check if we have exactly 2 unique latitudes and 2 unique longitudes
    const uniqueLats = [...new Set(lats.map(l => l.toFixed(4)))];
    const uniqueLngs = [...new Set(lngs.map(l => l.toFixed(4)))];
    
    return uniqueLats.length === 2 && uniqueLngs.length === 2;
  }

  formatLocation(result: LocationParseResult): string {
    if (result.point) {
      return `${result.point.lat.toFixed(6)}, ${result.point.lng.toFixed(6)}`;
    } else if (result.polygon) {
      return result.polygon.map(p => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`).join('; ');
    } else if (result.polyline) {
      return result.polyline.map(p => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`).join('; ');
    } else if (result.rectangle) {
      return result.rectangle.map(p => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`).join('; ');
    }
    return '';
  }
}
