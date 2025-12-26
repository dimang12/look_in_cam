import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, updateProfile } from 'firebase/auth';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'super_admin';
  lastLogin?: Date;
  firebaseUser?: FirebaseUser;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private auth = getAuth();
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Listen to Firebase auth state changes
    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to AdminUser
        const adminUser: AdminUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
          role: this.determineRole(firebaseUser.email),
          lastLogin: new Date(),
          firebaseUser: firebaseUser
        };
        
        // Save to localStorage and update subject
        localStorage.setItem('admin_user', JSON.stringify({
          id: adminUser.id,
          email: adminUser.email,
          username: adminUser.username,
          role: adminUser.role,
          lastLogin: adminUser.lastLogin
        }));
        this.currentUserSubject.next(adminUser);
      } else {
        localStorage.removeItem('admin_user');
        this.currentUserSubject.next(null);
      }
    });

    // Check if user was previously logged in
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser && !this.currentUserSubject.value) {
      try {
        const user = JSON.parse(savedUser);
        // Will be overridden by onAuthStateChanged if Firebase user is still authenticated
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing saved admin user:', error);
        localStorage.removeItem('admin_user');
      }
    }
  }

  /**
   * Determine user role based on email domain or specific emails
   */
  private determineRole(email: string | null): 'admin' | 'super_admin' {
    if (!email) return 'admin';
    
    // Define super admin emails
    const superAdminEmails = [
      'admin@whollycity.com',
      'superadmin@whollycity.com'
    ];
    
    if (superAdminEmails.includes(email.toLowerCase())) {
      return 'super_admin';
    }
    
    // Check for admin domain
    if (email.toLowerCase().endsWith('@whollycity.com')) {
      return 'admin';
    }
    
    return 'admin'; // Default role
  }

  /**
   * Admin login with Firebase Authentication
   */
  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Check if user has admin privileges
      if (!this.isAdminEmail(firebaseUser.email)) {
        await this.logout(); // Sign them out immediately
        return { success: false, message: 'Access denied. Admin privileges required.' };
      }
      
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          return { success: false, message: 'No admin account found with this email.' };
        case 'auth/wrong-password':
          return { success: false, message: 'Invalid password.' };
        case 'auth/invalid-email':
          return { success: false, message: 'Invalid email format.' };
        case 'auth/user-disabled':
          return { success: false, message: 'This admin account has been disabled.' };
        case 'auth/too-many-requests':
          return { success: false, message: 'Too many failed attempts. Please try again later.' };
        default:
          return { success: false, message: 'Login failed. Please try again.' };
      }
    }
  }

  /**
   * Create new admin user
   */
  async createAdmin(email: string, password: string, displayName?: string): Promise<{ success: boolean; message: string; user?: AdminUser }> {
    try {
      // Check if email is allowed for admin access
      if (!this.isAdminEmail(email)) {
        return { success: false, message: 'Email domain not authorized for admin access.' };
      }

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name if provided
      if (displayName && displayName.trim()) {
        await updateProfile(firebaseUser, { displayName: displayName.trim() });
      }
      
      const adminUser: AdminUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        username: displayName || firebaseUser.email?.split('@')[0] || 'Admin',
        role: this.determineRole(firebaseUser.email),
        lastLogin: new Date(),
        firebaseUser: firebaseUser
      };
      
      return { 
        success: true, 
        message: 'Admin account created successfully',
        user: adminUser
      };
    } catch (error: any) {
      console.error('Create admin error:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          return { success: false, message: 'An account with this email already exists.' };
        case 'auth/invalid-email':
          return { success: false, message: 'Invalid email format.' };
        case 'auth/weak-password':
          return { success: false, message: 'Password should be at least 6 characters.' };
        default:
          return { success: false, message: 'Failed to create admin account. Please try again.' };
      }
    }
  }

  /**
   * Check if email is authorized for admin access
   */
  private isAdminEmail(email: string | null): boolean {
    if (!email) return false;
    
    const adminEmails = [
      'admin@whollycity.com',
      'superadmin@whollycity.com'
    ];
    
    return adminEmails.includes(email.toLowerCase()) || email.toLowerCase().endsWith('@whollycity.com');
  }

  /**
   * Admin logout
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      // onAuthStateChanged will handle cleanup
    } catch (error) {
      console.error('Logout error:', error);
      // Force cleanup even if Firebase signout fails
      localStorage.removeItem('admin_user');
      this.currentUserSubject.next(null);
    }
  }

  /**
   * Check if admin is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user)
    );
  }

  /**
   * Get current admin user
   */
  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: 'admin' | 'super_admin'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (role === 'admin') {
      return user.role === 'admin' || user.role === 'super_admin';
    }
    
    return user.role === role;
  }
}