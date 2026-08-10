import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, SAMPLE_COUPONS } from './sampleData';

export async function seedInitialDataIfNeeded(force = false) {
  try {
    const hasSeededBefore = localStorage.getItem('shefalobd_has_seeded');
    const productsSnap = await getDocs(collection(db, 'products'));

    if ((productsSnap.empty && !hasSeededBefore) || force) {
      console.log('Seeding initial products into Firestore...');
      for (const prod of SAMPLE_PRODUCTS) {
        await setDoc(
          doc(db, 'products', prod.id),
          {
            ...prod,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      localStorage.setItem('shefalobd_has_seeded', 'true');
    }

    const categoriesSnap = await getDocs(collection(db, 'categories'));
    if ((categoriesSnap.empty && !hasSeededBefore) || force) {
      console.log('Seeding initial categories into Firestore...');
      for (const cat of SAMPLE_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      }
    }

    const couponsSnap = await getDocs(collection(db, 'coupons'));
    if ((couponsSnap.empty && !hasSeededBefore) || force) {
      console.log('Seeding initial coupons into Firestore...');
      for (const coup of SAMPLE_COUPONS) {
        await setDoc(doc(db, 'coupons', coup.id), coup, { merge: true });
      }
    }
  } catch (error) {
    console.warn('Auto-seed check error:', error);
  }
}

export async function forceSeedSampleData() {
  return seedInitialDataIfNeeded(true);
}

