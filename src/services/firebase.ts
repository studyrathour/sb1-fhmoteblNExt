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
  FirestoreError,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Batch } from '../types';

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

  // Real-time listeners
  onBatchesChange(
    onNext: (batches: Batch[]) => void,
    onError?: (error: FirestoreError) => void
  ) {
    const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, 
      (snapshot) => {
        const batches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Batch[];
        onNext(batches);
      },
      (error) => {
        console.error("Firestore (onBatchesChange): ", error);
        if (onError) onError(error);
      }
    );
  },
};
