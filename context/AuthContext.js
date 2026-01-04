import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          setProfile(userDoc.exists() ? userDoc.data() : null);
          setUser(currentUser);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Erreur de récupération du profil utilisateur', error);
        setUser(null);
        setProfile(null);
      } finally {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  const signup = useCallback(
    async ({ email, password, firstName, lastName, city }) => {
      try {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credentials.user, {
          displayName: `${firstName} ${lastName}`.trim(),
        });
        await setDoc(doc(db, 'users', credentials.user.uid), {
          firstName,
          lastName,
          city,
          email,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        Alert.alert('Inscription', error.message);
        throw error;
      }
    },
    []
  );

  const login = useCallback(async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Connexion', error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Déconnexion', error.message);
      throw error;
    }
  }, []);

  const value = {
    user,
    profile,
    initializing,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
