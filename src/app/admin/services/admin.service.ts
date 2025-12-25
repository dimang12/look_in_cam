import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'moderator' | 'admin';
  createdAt: Date;
  lastActive?: Date;
  isActive: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'news' | 'article' | 'announcement';
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt: Date;
  updatedAt?: Date;
  viewCount: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  publishedContent: number;
  todayViews: number;
  monthlyViews: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  private contentSubject = new BehaviorSubject<ContentItem[]>([]);
  private statsSubject = new BehaviorSubject<AdminStats | null>(null);

  public users$ = this.usersSubject.asObservable();
  public content$ = this.contentSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor() {
    this.loadMockData();
  }

  /**
   * Load mock data (replace with actual API calls)
   */
  private loadMockData(): void {
    // Mock users
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        username: 'johndoe',
        role: 'user',
        createdAt: new Date('2024-01-15'),
        lastActive: new Date('2024-12-23'),
        isActive: true
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        role: 'moderator',
        createdAt: new Date('2024-02-10'),
        lastActive: new Date('2024-12-22'),
        isActive: true
      },
      {
        id: '3',
        email: 'bob.wilson@example.com',
        username: 'bobwilson',
        role: 'user',
        createdAt: new Date('2024-03-05'),
        lastActive: new Date('2024-12-20'),
        isActive: false
      }
    ];

    // Mock content
    const mockContent: ContentItem[] = [
      {
        id: '1',
        title: 'Government announces new border security measures',
        type: 'news',
        status: 'published',
        author: 'Admin',
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2024-12-22'),
        viewCount: 1250
      },
      {
        id: '2',
        title: 'Economic development plans for 2025',
        type: 'article',
        status: 'published',
        author: 'Editor',
        createdAt: new Date('2024-12-18'),
        viewCount: 890
      },
      {
        id: '3',
        title: 'System maintenance announcement',
        type: 'announcement',
        status: 'draft',
        author: 'Admin',
        createdAt: new Date('2024-12-23'),
        viewCount: 0
      }
    ];

    // Mock stats
    const mockStats: AdminStats = {
      totalUsers: 156,
      activeUsers: 89,
      totalContent: 342,
      publishedContent: 298,
      todayViews: 2340,
      monthlyViews: 45670
    };

    this.usersSubject.next(mockUsers);
    this.contentSubject.next(mockContent);
    this.statsSubject.next(mockStats);
  }

  /**
   * Get all users
   */
  getUsers(): Observable<User[]> {
    return this.users$;
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | undefined {
    return this.usersSubject.value.find(user => user.id === id);
  }

  /**
   * Create or update user
   */
  saveUser(user: User): void {
    const users = this.usersSubject.value;
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    this.usersSubject.next([...users]);
  }

  /**
   * Delete user
   */
  deleteUser(id: string): void {
    const users = this.usersSubject.value.filter(user => user.id !== id);
    this.usersSubject.next(users);
  }

  /**
   * Get all content
   */
  getContent(): Observable<ContentItem[]> {
    return this.content$;
  }

  /**
   * Get content by ID
   */
  getContentById(id: string): ContentItem | undefined {
    return this.contentSubject.value.find(content => content.id === id);
  }

  /**
   * Create or update content
   */
  saveContent(content: ContentItem): void {
    const contentItems = this.contentSubject.value;
    const existingIndex = contentItems.findIndex(c => c.id === content.id);
    
    if (existingIndex >= 0) {
      contentItems[existingIndex] = { ...content, updatedAt: new Date() };
    } else {
      contentItems.push(content);
    }
    
    this.contentSubject.next([...contentItems]);
  }

  /**
   * Delete content
   */
  deleteContent(id: string): void {
    const contentItems = this.contentSubject.value.filter(content => content.id !== id);
    this.contentSubject.next(contentItems);
  }

  /**
   * Get admin stats
   */
  getStats(): Observable<AdminStats | null> {
    return this.stats$;
  }

  /**
   * Update content status
   */
  updateContentStatus(id: string, status: 'draft' | 'published' | 'archived'): void {
    const contentItems = this.contentSubject.value;
    const contentIndex = contentItems.findIndex(c => c.id === id);
    
    if (contentIndex >= 0) {
      contentItems[contentIndex] = { 
        ...contentItems[contentIndex], 
        status,
        updatedAt: new Date() 
      };
      this.contentSubject.next([...contentItems]);
    }
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(id: string): void {
    const users = this.usersSubject.value;
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex >= 0) {
      users[userIndex] = { 
        ...users[userIndex], 
        isActive: !users[userIndex].isActive 
      };
      this.usersSubject.next([...users]);
    }
  }
}