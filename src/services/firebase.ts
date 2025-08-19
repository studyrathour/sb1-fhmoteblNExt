import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Batch, LiveClass, Content, Subject, Section } from '../types';

export const firebaseService = {
  // Batches
  async addBatch(batch: Omit<Batch, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'batches'), {
        ...batch,
        createdAt: new Date(),
        isActive: true,
        enrolledStudents: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding batch:', error);
      throw error;
    }
  },

  async getBatches() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'batches'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Batch[];
    } catch (error) {
      console.error('Error getting batches:', error);
      throw error;
    }
  },

  async updateBatch(id: string, updates: Partial<Batch>) {
    try {
      await updateDoc(doc(db, 'batches', id), updates);
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  },

  async deleteBatch(id: string) {
    try {
      await deleteDoc(doc(db, 'batches', id));
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  },

  // Live Classes
  async addLiveClass(liveClass: Omit<LiveClass, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'liveClasses'), {
        ...liveClass,
        isLive: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding live class:', error);
      throw error;
    }
  },

  async getLiveClasses() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'liveClasses'), orderBy('scheduledTime', 'asc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledTime: doc.data().scheduledTime?.toDate()
      })) as LiveClass[];
    } catch (error) {
      console.error('Error getting live classes:', error);
      throw error;
    }
  },

  async updateLiveClass(id: string, updates: Partial<LiveClass>) {
    try {
      await updateDoc(doc(db, 'liveClasses', id), updates);
    } catch (error) {
      console.error('Error updating live class:', error);
      throw error;
    }
  },

  async deleteLiveClass(id: string) {
    try {
      await deleteDoc(doc(db, 'liveClasses', id));
    } catch (error) {
      console.error('Error deleting live class:', error);
      throw error;
    }
  },

  // Real-time listeners
  onBatchesChange(callback: (batches: Batch[]) => void) {
    return onSnapshot(
      query(collection(db, 'batches'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const batches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Batch[];
        callback(batches);
      }
    );
  },

  onLiveClassesChange(callback: (liveClasses: LiveClass[]) => void) {
    return onSnapshot(
      query(collection(db, 'liveClasses'), orderBy('scheduledTime', 'asc')),
      (snapshot) => {
        const liveClasses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledTime: doc.data().scheduledTime?.toDate()
        })) as LiveClass[];
        callback(liveClasses);
      }
    );
  }
};