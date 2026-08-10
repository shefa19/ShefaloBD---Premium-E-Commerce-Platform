import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, getCleanAuthErrorMessage } from '../lib/firebase';
import { validateStrongPassword } from '../lib/formatters';
import { UserProfile, Address } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Subscribe to user doc real-time
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubDoc = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              setUserProfile(snapshot.data() as UserProfile);
            } else {
              // Create user profile if missing
              const cleanEmail = currentUser.email?.toLowerCase();
              const isAdminEmail = cleanEmail === 'sishefa19@gmail.com' || cleanEmail === 'name@example.com';
              const newProfile: UserProfile = {
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                email: currentUser.email || '',
                role: isAdminEmail ? 'admin' : 'user',
                addresses: [],
                wishlist: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              try {
                await setDoc(userDocRef, newProfile);
                setUserProfile(newProfile);
              } catch (e) {
                console.error("Error creating profile", e);
              }
            }
            setLoading(false);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
            setLoading(false);
          }
        );
        return () => unsubDoc();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      showToast('Successfully signed in!', 'success');
    } catch (err: any) {
      // Auto-provision demo admin if name@example.com isn't registered in Firebase Auth yet
      if (email.toLowerCase() === 'name@example.com') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          const newProfile: UserProfile = {
            uid: cred.user.uid,
            name: 'Demo Admin',
            email: email,
            role: 'admin',
            addresses: [],
            wishlist: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', cred.user.uid), newProfile);
          showToast('Signed in as Admin!', 'success');
          return;
        } catch (regErr: any) {
          // If creation fails because user exists (e.g. invalid password passed), fall back to original error
        }
      }
      const msg = getCleanAuthErrorMessage(err);
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const passValidation = validateStrongPassword(pass);
    if (!passValidation.isValid) {
      const msg = passValidation.error || 'Password does not meet security requirements.';
      showToast(msg, 'error');
      throw new Error(msg);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const cleanEmail = email.toLowerCase();
      const isAdminEmail = cleanEmail === 'sishefa19@gmail.com' || cleanEmail === 'name@example.com';
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        name: name,
        email: email,
        role: isAdminEmail ? 'admin' : 'user',
        addresses: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      showToast('Account created successfully!', 'success');
    } catch (err: any) {
      const msg = getCleanAuthErrorMessage(err);
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      showToast(`Welcome back, ${result.user.displayName || 'User'}!`, 'success');
    } catch (err: any) {
      const msg = getCleanAuthErrorMessage(err);
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      showToast('Signed out successfully.', 'info');
    } catch (err: any) {
      const msg = getCleanAuthErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
      showToast('Password reset link sent to your email', 'success');
    } catch (err: any) {
      const msg = getCleanAuthErrorMessage(err);
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updated = { ...data, updatedAt: new Date().toISOString() };
      await updateDoc(userRef, updated);
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user || !userProfile) {
      showToast('Please sign in to add items to your wishlist', 'info');
      return;
    }
    const currentWishlist = userProfile.wishlist || [];
    const exists = currentWishlist.includes(productId);
    const updatedWishlist = exists
      ? currentWishlist.filter((id) => id !== productId)
      : [...currentWishlist, productId];

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        wishlist: updatedWishlist,
        updatedAt: new Date().toISOString(),
      });
      showToast(
        exists ? 'Removed from Wishlist' : 'Added to Wishlist!',
        exists ? 'info' : 'success'
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addAddress = async (newAddr: Omit<Address, 'id'>) => {
    if (!user || !userProfile) return;
    const addressId = 'addr-' + Date.now();
    const addressObj: Address = { ...newAddr, id: addressId };
    
    let currentAddresses = userProfile.addresses || [];
    if (addressObj.isDefault) {
      currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
    } else if (currentAddresses.length === 0) {
      addressObj.isDefault = true;
    }

    const updatedAddresses = [...currentAddresses, addressObj];

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString(),
      });
      showToast('Address added successfully', 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const removeAddress = async (addressId: string) => {
    if (!user || !userProfile) return;
    const updatedAddresses = (userProfile.addresses || []).filter((a) => a.id !== addressId);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString(),
      });
      showToast('Address removed', 'info');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user || !userProfile) return;
    const updatedAddresses = (userProfile.addresses || []).map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString(),
      });
      showToast('Default address updated', 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const isAdmin = userProfile?.role === 'admin' || user?.email?.toLowerCase() === 'sishefa19@gmail.com' || user?.email?.toLowerCase() === 'name@example.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        updateProfileData,
        toggleWishlist,
        addAddress,
        removeAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
