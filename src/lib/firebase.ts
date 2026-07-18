import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  addDoc,
  deleteDoc
} from 'firebase/firestore';

// Standard Firebase config. Loads from environment variables.
// If not present, we fall back to robust local offline-first simulation.
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || ""
};

const isFirebaseConfigured = !!firebaseConfig.apiKey;

let app;
let firestoreDb: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(app);
    console.log("Firebase initialized successfully in Curious Bharat!");
  } catch (err) {
    console.error("Firebase init failed, running on offline-first backup engine", err);
  }
}

// ==========================================
// OFFLINE-FIRST BACKUP ENGINE (LocalStorage + Event Dispatcher)
// Ensures 100% features work perfectly offline or in sandbox
// ==========================================
class OfflineDatabase {
  private getStorage(key: string): any[] {
    const raw = localStorage.getItem(`curious_db_${key}`);
    return raw ? JSON.parse(raw) : [];
  }

  private saveStorage(key: string, data: any[]) {
    localStorage.setItem(`curious_db_${key}`, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(`curious_db_update_${key}`, { detail: data }));
  }

  async getCollection(collName: string): Promise<any[]> {
    return this.getStorage(collName);
  }

  async addDocument(collName: string, data: any): Promise<any> {
    const coll = this.getStorage(collName);
    const newDoc = { id: Math.random().toString(36).substring(2, 11), createdAt: new Date().toISOString(), ...data };
    coll.push(newDoc);
    this.saveStorage(collName, coll);
    return newDoc;
  }

  async setDocument(collName: string, id: string, data: any): Promise<void> {
    const coll = this.getStorage(collName);
    const idx = coll.findIndex(d => d.id === id);
    if (idx !== -1) {
      coll[idx] = { ...coll[idx], ...data, id };
    } else {
      coll.push({ id, ...data });
    }
    this.saveStorage(collName, coll);
  }

  async updateDocument(collName: string, id: string, data: any): Promise<void> {
    return this.setDocument(collName, id, data);
  }

  async deleteDocument(collName: string, id: string): Promise<void> {
    const coll = this.getStorage(collName);
    const filtered = coll.filter(d => d.id !== id);
    this.saveStorage(collName, filtered);
  }

  subscribe(collName: string, callback: (data: any[]) => void): () => void {
    const handler = (e: Event) => {
      callback((e as CustomEvent).detail);
    };
    window.addEventListener(`curious_db_update_${collName}`, handler);
    // Initial emission
    callback(this.getStorage(collName));
    return () => {
      window.removeEventListener(`curious_db_update_${collName}`, handler);
    };
  }
}

const offlineDb = new OfflineDatabase();

// ==========================================
// UNIFIED DATA SYNC ACCESSORS
// ==========================================
export const dbService = {
  isOnline(): boolean {
    return navigator.onLine;
  },

  // 1. Comments/Community API
  subscribeComments(lectureId: string, callback: (comments: any[]) => void): () => void {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const q = query(
          collection(firestoreDb, 'comments'),
          where('lectureId', '==', lectureId)
        );
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by likes or date
            list.sort((a: any, b: any) => {
              if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            callback(list);
          },
          (err) => {
            console.warn("Firestore comments snapshot listener failed, likely offline/sandbox restriction:", err);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.warn("Failed to subscribe comments on Firestore, using offline engine instead:", err);
      }
    }
    
    return offlineDb.subscribe('comments', (data) => {
      const filtered = data.filter(d => d.lectureId === lectureId);
      filtered.sort((a: any, b: any) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      callback(filtered);
    });
  },

  async addComment(comment: {
    lectureId: string;
    userName: string;
    text: string;
    isPinned?: boolean;
    replies?: any[];
    likes: number;
    likedBy?: string[];
  }): Promise<void> {
    const payload = {
      ...comment,
      createdAt: new Date().toISOString(),
      isPinned: comment.isPinned || false,
      replies: comment.replies || [],
      likedBy: comment.likedBy || []
    };
    if (isFirebaseConfigured && firestoreDb) {
      try {
        await addDoc(collection(firestoreDb, 'comments'), payload);
        return;
      } catch (err) {
        console.warn("addComment failed on Firestore, running on offline-first fallback:", err);
      }
    }
    await offlineDb.addDocument('comments', payload);
  },

  async updateComment(commentId: string, updates: any): Promise<void> {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        await updateDoc(doc(firestoreDb, 'comments', commentId), updates);
        return;
      } catch (err) {
        console.warn("updateComment failed on Firestore, running on offline-first fallback:", err);
      }
    }
    await offlineDb.updateDocument('comments', commentId, updates);
  },

  async deleteComment(commentId: string): Promise<void> {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, 'comments', commentId));
        return;
      } catch (err) {
        console.warn("deleteComment failed on Firestore, running on offline-first fallback:", err);
      }
    }
    await offlineDb.deleteDocument('comments', commentId);
  },

  // 2. Announcements
  subscribeAnnouncements(callback: (announcements: any[]) => void): () => void {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const q = query(collection(firestoreDb, 'announcements'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(list);
          },
          (err) => {
            console.warn("Firestore announcements snapshot listener failed:", err);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.warn("Failed to subscribe announcements on Firestore, using offline engine instead:", err);
      }
    }
    
    return offlineDb.subscribe('announcements', (data) => {
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(data);
    });
  },

  async addAnnouncement(text: string, title: string = "Teacher Announcement"): Promise<void> {
    const payload = { title, text, createdAt: new Date().toISOString() };
    if (isFirebaseConfigured && firestoreDb) {
      try {
        await addDoc(collection(firestoreDb, 'announcements'), payload);
        return;
      } catch (err) {
        console.warn("addAnnouncement failed on Firestore, running on offline-first fallback:", err);
      }
    }
    await offlineDb.addDocument('announcements', payload);
  },

  // 3. Referral Money & Accounts Tracker
  async getReferralStatus(studentId: string): Promise<{ balance: number; referrals: any[] }> {
    const key = `referrals_${studentId}`;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const d = await getDoc(doc(firestoreDb, 'students', studentId));
        if (d.exists()) {
          const data = d.data();
          return { balance: data.referralBalance || 0, referrals: data.referrals || [] };
        }
      } catch (err) {
        console.warn("getReferralStatus failed on Firestore, running on offline-first fallback:", err);
      }
    }
    // Offline / LocalStorage fallback
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { balance: 0, referrals: [] };
  },

  async saveReferralStatus(studentId: string, balance: number, referrals: any[]): Promise<void> {
    const data = { referralBalance: balance, referrals };
    if (isFirebaseConfigured && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'students', studentId), data, { merge: true });
      } catch (err) {
        console.warn("saveReferralStatus failed on Firestore, running on offline-first fallback:", err);
      }
    }
    localStorage.setItem(`referrals_${studentId}`, JSON.stringify(data));
  },

  // 4. Feedback System (Ratings, feature requests, bug reports)
  async submitFeedback(feedback: {
    type: 'rating' | 'bug' | 'feature' | 'suggestion';
    studentName: string;
    studentEmail: string;
    text: string;
    rating?: number;
  }): Promise<void> {
    const payload = { ...feedback, createdAt: new Date().toISOString() };
    if (isFirebaseConfigured && firestoreDb) {
      try {
        await addDoc(collection(firestoreDb, 'feedback'), payload);
        return;
      } catch (err) {
        console.warn("submitFeedback failed on Firestore, running on offline-first fallback:", err);
      }
    }
    await offlineDb.addDocument('feedback', payload);
  },

  async getFeedbackList(): Promise<any[]> {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const q = query(collection(firestoreDb, 'feedback'), orderBy('createdAt', 'desc'));
        const s = await getDocs(q);
        return s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("getFeedbackList failed on Firestore, running on offline-first fallback:", err);
      }
    }
    return offlineDb.getCollection('feedback');
  },

  // 5. Version Info (APK System)
  async getAPKVersionInfo(): Promise<{ version: string; url: string; notes: string; sizeMB: number; lastUpdated: string }> {
    const defaultInfo = {
      version: "v2.1.0",
      url: "https://curiousbharat.org/downloads/app.apk",
      notes: "🌟 Major updates! Introducing high-contrast light/dark modes, AI descriptive test evaluators, and native YouTube player custom controls overlays.",
      sizeMB: 38,
      lastUpdated: new Date().toDateString()
    };
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'system', 'apk_info');
        const d = await getDoc(docRef);
        if (d.exists()) {
          return d.data() as any;
        }
      } catch (err) {
        console.warn("getAPKVersionInfo failed on Firestore, running on offline-first fallback:", err);
      }
    }
    const saved = localStorage.getItem('apk_info');
    return saved ? JSON.parse(saved) : defaultInfo;
  },

  async saveAPKVersionInfo(info: any): Promise<void> {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'system', 'apk_info'), info);
      } catch (err) {
        console.warn("saveAPKVersionInfo failed on Firestore, running on offline-first fallback:", err);
      }
    }
    localStorage.setItem('apk_info', JSON.stringify(info));
  },

  // 6. Batch Join Requests (Teacher/Owner Approval Flow)
  async submitJoinRequest(request: {
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    isPaid: boolean;
    price: string;
  }): Promise<void> {
    const payload = {
      ...request,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && firestoreDb) {
      try {
        await addDoc(collection(firestoreDb, 'join_requests'), payload);
        return;
      } catch (err) {
        console.warn("submitJoinRequest failed on Firestore, running on offline-first fallback:", err);
      }
    }
    await offlineDb.addDocument('join_requests', payload);
  },

  async getJoinRequests(): Promise<any[]> {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const q = query(collection(firestoreDb, 'join_requests'), orderBy('createdAt', 'desc'));
        const s = await getDocs(q);
        return s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("getJoinRequests failed on Firestore, running on offline-first fallback:", err);
      }
    }
    return offlineDb.getCollection('join_requests');
  },

  async updateJoinRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<void> {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'join_requests', requestId);
        await setDoc(docRef, { status }, { merge: true });
        return;
      } catch (err) {
        console.warn("updateJoinRequestStatus failed on Firestore, running on offline-first fallback:", err);
      }
    }
    // Update local offline document
    const offlineItems = await offlineDb.getCollection('join_requests');
    const updated = offlineItems.map((item: any) => {
      if (item.id === requestId || item._id === requestId || item.courseId === requestId) {
        return { ...item, status };
      }
      return item;
    });
    localStorage.setItem('offline_db_join_requests', JSON.stringify(updated));
  }
};
