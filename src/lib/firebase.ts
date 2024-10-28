import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  writeBatch, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDp8b3hGTrLSjejw0LMd3KTSSAe8SJEIUg",
  authDomain: "text-snipped-app.firebaseapp.com",
  projectId: "text-snipped-app",
  storageBucket: "text-snipped-app.appspot.com",
  messagingSenderId: "126956590942",
  appId: "1:126956590942:web:477691dc75b158e46161cf",
  measurementId: "G-B3G4LVDVG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Snippets
export const addSnippet = async (snippet: any) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    const docRef = await addDoc(collection(db, 'snippets'), {
      ...snippet,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Add snippet error:', error);
    throw error;
  }
};

export const addBatchSnippets = async (snippets: any[]) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    const batch = writeBatch(db);
    const snippetsRef = collection(db, 'snippets');

    snippets.forEach((snippet) => {
      const newDoc = doc(snippetsRef);
      batch.set(newDoc, {
        ...snippet,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Batch add snippets error:', error);
    throw error;
  }
};

export const updateSnippet = async (id: string, updates: any) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    const docRef = doc(db, 'snippets', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Update snippet error:', error);
    throw error;
  }
};

export const deleteSnippet = async (id: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    await deleteDoc(doc(db, 'snippets', id));
  } catch (error) {
    console.error('Delete snippet error:', error);
    throw error;
  }
};

export const loadUserSnippets = async (userId: string) => {
  try {
    const snippetsRef = collection(db, 'snippets');
    const q = query(snippetsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Load snippets error:', error);
    throw error;
  }
};

export const subscribeToUserSnippets = (userId: string, callback: (snippets: any[]) => void) => {
  const snippetsRef = collection(db, 'snippets');
  const q = query(snippetsRef, where('userId', '==', userId));
  
  return onSnapshot(q, {
    next: (querySnapshot) => {
      const snippets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(snippets);
    },
    error: (error) => {
      console.error('Snippets subscription error:', error);
    }
  });
};

// Folders
export const addFolder = async (folder: any) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    const docRef = await addDoc(collection(db, 'folders'), {
      ...folder,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Add folder error:', error);
    throw error;
  }
};

export const updateFolder = async (id: string, name: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    const docRef = doc(db, 'folders', id);
    await updateDoc(docRef, { name });
  } catch (error) {
    console.error('Update folder error:', error);
    throw error;
  }
};

export const deleteFolder = async (id: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  try {
    const batch = writeBatch(db);
    
    // Update snippets in this folder
    const snippetsRef = collection(db, 'snippets');
    const q = query(snippetsRef, where('folderId', '==', id));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { folderId: null });
    });

    // Delete the folder
    const folderRef = doc(db, 'folders', id);
    batch.delete(folderRef);

    await batch.commit();
  } catch (error) {
    console.error('Delete folder error:', error);
    throw error;
  }
};

export const loadUserFolders = async (userId: string) => {
  try {
    const foldersRef = collection(db, 'folders');
    const q = query(foldersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Load folders error:', error);
    throw error;
  }
};

export const subscribeToUserFolders = (userId: string, callback: (folders: any[]) => void) => {
  const foldersRef = collection(db, 'folders');
  const q = query(foldersRef, where('userId', '==', userId));
  
  return onSnapshot(q, {
    next: (querySnapshot) => {
      const folders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(folders);
    },
    error: (error) => {
      console.error('Folders subscription error:', error);
    }
  });
};