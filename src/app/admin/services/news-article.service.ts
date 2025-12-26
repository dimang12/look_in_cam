import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, limit, startAfter, DocumentData, QueryDocumentSnapshot, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { NewsArticle, NewsArticleFormData } from '../models/news-article.model';

@Injectable({
  providedIn: 'root'
})
export class NewsArticleService {
  private db = getFirestore(getApp());
  private collectionName = 'news_articles';

  constructor() { 
    console.log('NewsArticleService: Initializing with Firebase app...');
    try {
      const app = getApp();
      console.log('NewsArticleService: Firebase app config:', app.options);
      this.db = getFirestore(app);
      console.log('NewsArticleService: Firestore initialized successfully');
    } catch (error) {
      console.error('NewsArticleService: Error initializing Firestore:', error);
    }
  }

  /**
   * Get all news articles with pagination
   */
  getArticles(pageSize: number = 10, lastDoc?: QueryDocumentSnapshot<DocumentData>): Observable<{ articles: NewsArticle[], lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    console.log('NewsArticleService: Getting articles from Firestore...');
    const articlesRef = collection(this.db, this.collectionName);
    
    // Try a simple query first without ordering to see if articles exist
    let articlesQuery = query(articlesRef, limit(pageSize));

    if (lastDoc) {
      articlesQuery = query(
        articlesRef,
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    return from(getDocs(articlesQuery)).pipe(
      map(querySnapshot => {
        console.log('NewsArticleService: Query completed, got', querySnapshot.size, 'documents');
        const articles: NewsArticle[] = [];
        let lastDocument: QueryDocumentSnapshot<DocumentData> | undefined;

        querySnapshot.forEach(doc => {
          const data = doc.data();
          articles.push({
            id: doc.id,
            title: data['title'] || 'Untitled',
            content: data['content'] || '',
            author: data['author'] || 'Unknown',
            publishedDate: data['publishedDate']?.toDate(),
            createdDate: data['createdDate']?.toDate() || new Date(),
            updatedDate: data['updatedDate']?.toDate() || new Date(),
            status: data['status'] || 'draft',
            category: data['category'] || 'General',
            tags: data['tags'] || [],
            featuredImage: data['featuredImage'],
            views: data['views'] || 0,
            summary: data['summary'] || '',
            political_perspective: data['political_perspective'] || '',
            cambodia_impact: data['cambodia_impact'] || ''
          });
          lastDocument = doc;
        });
        return { articles, lastDoc: lastDocument };
      }),
      catchError(error => {
        console.error('NewsArticleService: Error fetching articles:', error);
        return of({ articles: [] });
      })
    );
  }

  /**
   * Get articles by status
   */
  getArticlesByStatus(status: 'draft' | 'published' | 'archived'): Observable<NewsArticle[]> {
    console.log('NewsArticleService: Getting articles by status:', status);
    const articlesRef = collection(this.db, this.collectionName);
    const articlesQuery = query(
      articlesRef, 
      where('status', '==', status)
    );

    return from(getDocs(articlesQuery)).pipe(
      map(querySnapshot => {
        console.log('NewsArticleService: Status query completed, got', querySnapshot.size, 'documents');
        const articles: NewsArticle[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          console.log('NewsArticleService: Processing status document:', doc.id, data);
          articles.push({
            id: doc.id,
            title: data['title'] || 'Untitled',
            content: data['content'] || '',
            author: data['author'] || 'Unknown',
            publishedDate: data['publishedDate']?.toDate(),
            createdDate: data['createdDate']?.toDate() || new Date(),
            updatedDate: data['updatedDate']?.toDate() || new Date(),
            status: data['status'] || 'draft',
            category: data['category'] || 'General',
            tags: data['tags'] || [],
            featuredImage: data['featuredImage'],
            views: data['views'] || 0,
            summary: data['summary'] || '',
            political_perspective: data['political_perspective'] || '',
            cambodia_impact: data['cambodia_impact'] || ''
          });
        });
        return articles;
      }),
      catchError(error => {
        console.error('NewsArticleService: Error fetching articles by status:', error);
        return of([]);
      })
    );
  }

  /**
   * Create new article
   */
  createArticle(articleData: NewsArticleFormData): Observable<string> {
    const articlesRef = collection(this.db, this.collectionName);
    const now = new Date();
    
    const newArticle = {
      ...articleData,
      createdDate: now,
      updatedDate: now,
      publishedDate: articleData.status === 'published' ? now : null,
      views: 0
    };

    return from(addDoc(articlesRef, newArticle)).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        console.error('Error creating article:', error);
        throw error;
      })
    );
  }

  /**
   * Update article
   */
  updateArticle(articleId: string, articleData: Partial<NewsArticleFormData>): Observable<void> {
    const articleRef = doc(this.db, this.collectionName, articleId);
    
    // Clean the update data to remove undefined values
    const updateData: any = {
      updatedDate: new Date()
    };

    // Only add fields that have values
    if (articleData.title !== undefined) updateData.title = articleData.title;
    if (articleData.content !== undefined) updateData.content = articleData.content;
    if (articleData.author !== undefined) updateData.author = articleData.author;
    if (articleData.category !== undefined) updateData.category = articleData.category;
    if (articleData.status !== undefined) updateData.status = articleData.status;
    if (articleData.tags !== undefined) updateData.tags = articleData.tags;
    if (articleData.featuredImage !== undefined) updateData.featuredImage = articleData.featuredImage;
    if (articleData.summary !== undefined) updateData.summary = articleData.summary;
    if (articleData.political_perspective !== undefined) updateData.political_perspective = articleData.political_perspective;
    if (articleData.cambodia_impact !== undefined) updateData.cambodia_impact = articleData.cambodia_impact;

    // If status is being changed to published and publishedDate is not set
    if (articleData.status === 'published') {
      updateData.publishedDate = new Date();
    }

    return from(updateDoc(articleRef, updateData)).pipe(
      catchError(error => {
        console.error('Error updating article:', error);
        throw error;
      })
    );
  }

  /**
   * Delete article
   */
  deleteArticle(articleId: string): Observable<void> {
    const articleRef = doc(this.db, this.collectionName, articleId);
    
    return from(deleteDoc(articleRef)).pipe(
      catchError(error => {
        console.error('Error deleting article:', error);
        throw error;
      })
    );
  }

  /**
   * Get article statistics
   */
  getArticleStats(): Observable<{ total: number, published: number, drafts: number, archived: number }> {
    return this.getArticles(1000).pipe(
      map(result => {
        const articles = result.articles;
        return {
          total: articles.length,
          published: articles.filter(a => a.status === 'published').length,
          drafts: articles.filter(a => a.status === 'draft').length,
          archived: articles.filter(a => a.status === 'archived').length
        };
      })
    );
  }

  /** Count articles published today */
  getTodayPublishedCount(): Observable<number> {
    return this.getArticles(1000).pipe(
      map(result => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const toDate = (value: any): Date | null => {
          if (!value) return null;
          if (value instanceof Date) return value;
          // Firestore Timestamp support
          if (value.seconds !== undefined) return new Date(value.seconds * 1000);
          const parsed = new Date(value);
          return isNaN(parsed.getTime()) ? null : parsed;
        };

        return result.articles.filter(article => {
          const publishedDate = toDate((article as any).publishedDate);
          return publishedDate !== null && publishedDate >= startOfDay && publishedDate < endOfDay;
        }).length;
      })
    );
  }

  /** Get single article by id */
  getArticleById(id: string): Observable<NewsArticle | null> {
    const articleRef = doc(this.db, this.collectionName, id);
    return from(getDoc(articleRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) return null;
        const data = snapshot.data();
        return {
          id: snapshot.id,
          title: data['title'] || 'Untitled',
          content: data['content'] || '',
          author: data['author'] || 'Unknown',
          publishedDate: data['publishedDate']?.toDate(),
          createdDate: data['createdDate']?.toDate() || new Date(),
          updatedDate: data['updatedDate']?.toDate() || new Date(),
          status: data['status'] || 'draft',
          category: data['category'] || 'General',
          tags: data['tags'] || [],
          featuredImage: data['featuredImage'],
          views: data['views'] || 0,
          summary: data['summary'] || '',
          political_perspective: data['political_perspective'] || '',
          cambodia_impact: data['cambodia_impact'] || ''
        } as NewsArticle;
      }),
      catchError(error => {
        console.error('Error fetching article by id', error);
        return of(null);
      })
    );
  }
}