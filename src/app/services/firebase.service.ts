import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';

export interface MarkerItem {
  id?: string;
  title: string;
  type?: string;
  position: { lat: number; lng: number };
  createdAt?: any;
}

export interface CrimeReport {
  id?: string;
  title: string;
  description: string;
  crimeType: string;
  timestamp: number;
  location: { latitude: number; longitude: number };
  address: string;
  reportedBy: { userId: string; name: string };
  status: string;
  attachments: string[];
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor() {}

  // Add a marker document to `markers` collection
  async addMarker(marker: MarkerItem): Promise<void> {
    const db = getFirestore();
    const markersRef = collection(db, 'markers');
    await addDoc(markersRef, {
      title: marker.title,
      type: marker.type || null,
      position: marker.position,
      createdAt: new Date()
    });
  }

  // Fetch markers (simple one-time load)
  async listMarkers(): Promise<MarkerItem[]> {
    const db = getFirestore();
    const markersRef = collection(db, 'markers');
    const snap = await getDocs(markersRef);
    const items: MarkerItem[] = [];
    snap.forEach((doc: QueryDocumentSnapshot) => items.push({ id: doc.id, ...(doc.data() as any) }));
    return items;
  }

  // Add a crime report document to the ` crimeReports ` collection
  async addCrimeReport(report: CrimeReport): Promise<void> {
    const db = getFirestore();
    const reportsRef = collection(db, 'MapCrimeReported');
    await addDoc(reportsRef, report);
  }

  // Fetch crime reports from the `MapCrimeReported` collection
  async listCrimeReports(): Promise<CrimeReport[]> {
    const db = getFirestore();
    const reportsRef = collection(db, 'MapCrimeReported');
    const snap = await getDocs(reportsRef);
    const items: CrimeReport[] = [];
    snap.forEach((doc: QueryDocumentSnapshot) => items.push({ id: doc.id, ...(doc.data() as any) }));
    return items;
  }
}
