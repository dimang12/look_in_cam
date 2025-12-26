import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, getDocs, QueryDocumentSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface MarkerItem {
  id?: string;
  title: string;
  type?: string;
  position: { lat: number; lng: number };
  imageUrl?: string;
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

export interface NewsArticle {
  doc_id?: string;
  title: string;
  url: string;
  source_url: string;
  date?: any;
  snippet: string;
  content: string;
  relevant_to_border_conflict?: boolean;
  summary_md?: string;
  summary?: string;
  political_movement?: string;
  political_perspective?: string;
  cambodia_impact?: string;
  khmer_translation?: string;
  analyzed_at?: string;
  viewed?: number;
}

export type MapShapeType = 'circle' | 'polygon' | 'polyline' | 'rectangle';
export interface MapShapeRecord {
  id?: string;
  type: MapShapeType;
  // For circle
  center?: { lat: number; lng: number };
  radius?: number;
  // For polygon/polyline/rectangle (paths as array of lat/lng)
  path?: Array<{ lat: number; lng: number }>;
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor() {}

  // Add a marker document to `markers` collection
  async addMarker(marker: MarkerItem): Promise<string> {
    const db = getFirestore();
    const markersRef = collection(db, 'markers');
    const docRef = await addDoc(markersRef, {
      title: marker.title,
      type: marker.type || null,
      position: marker.position,
      imageUrl: marker.imageUrl || null,
      createdAt: new Date()
    });
    return docRef.id;
  }

  // Fetch markers (simple one-time load)
  async listMarkers(): Promise<MarkerItem[]> {
    const db = getFirestore();
    const markersRef = collection(db, 'markers');
    const snap = await getDocs(markersRef);
    const items: MarkerItem[] = [];
    snap.forEach((d: QueryDocumentSnapshot) => items.push({ id: d.id, ...(d.data() as any) }));
    return items;
  }

  async updateMarker(id: string, marker: MarkerItem): Promise<void> {
    const db = getFirestore();
    const markerRef = doc(db, 'markers', id);
    await updateDoc(markerRef, {
      title: marker.title,
      type: marker.type || null,
      position: marker.position,
      imageUrl: marker.imageUrl || null
    });
  }

  async deleteMarker(id: string): Promise<void> {
    const db = getFirestore();
    const markerRef = doc(db, 'markers', id);
    await deleteDoc(markerRef);
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

  // Upload an image file to Firebase Storage and return its download URL
  async uploadImage(file: File, folder: string = 'uploads'): Promise<string> {
    const storage = getStorage();
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = `${folder}/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  // Shapes persistence
  async addShape(shape: MapShapeRecord): Promise<void> {
    const db = getFirestore();
    const shapesRef = collection(db, 'map_shapes');
    await addDoc(shapesRef, {
      type: shape.type,
      center: shape.center || null,
      radius: shape.radius || null,
      path: shape.path || null,
      createdAt: new Date()
    });
  }

  async listShapes(): Promise<MapShapeRecord[]> {
    const db = getFirestore();
    const shapesRef = collection(db, 'map_shapes');
    const snap = await getDocs(shapesRef);
    const items: MapShapeRecord[] = [];
    snap.forEach((doc: QueryDocumentSnapshot) => items.push({ id: doc.id, ...(doc.data() as any) }));
    return items;
  }

  // News articles methods
  async getNewsArticles(): Promise<NewsArticle[]> {
    const db = getFirestore();
    const newsRef = collection(db, 'news_articles');
    const snap = await getDocs(newsRef);
    const articles: NewsArticle[] = [];
    
    snap.forEach((doc: QueryDocumentSnapshot) => {
      articles.push({ 
        doc_id: doc.id, 
        ...(doc.data() as Omit<NewsArticle, 'doc_id'>) 
      });
    });
    
    // Sort by date or analyzed_at (newest first)
    articles.sort((a, b) => {
      const dateA = a.date || a.analyzed_at || new Date(0);
      const dateB = b.date || b.analyzed_at || new Date(0);
      
      // Handle Firestore timestamps
      const timestampA = dateA && typeof dateA.toDate === 'function' ? dateA.toDate() : new Date(dateA);
      const timestampB = dateB && typeof dateB.toDate === 'function' ? dateB.toDate() : new Date(dateB);
      
      return timestampB.getTime() - timestampA.getTime();
    });
    
    return articles;
  }

  async addNewsArticle(article: Omit<NewsArticle, 'doc_id'>): Promise<string> {
    const db = getFirestore();
    const newsRef = collection(db, 'news_articles');
    const docRef = await addDoc(newsRef, {
      ...article,
      analyzed_at: new Date(),
      viewed: 0
    });
    return docRef.id;
  }

  async updateNewsArticleViews(articleId: string, viewCount: number): Promise<void> {
    const db = getFirestore();
    const articleRef = doc(db, 'news_articles', articleId);
    await updateDoc(articleRef, {
      viewed: viewCount
    });
  }
}
