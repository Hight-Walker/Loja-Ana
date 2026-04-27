import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { db, auth } from "./firebase";
import { Product, Order, User, StoreConfig, OperationType } from "../types";

// Collection names
const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";
const USERS_COLLECTION = "users";
const CONFIG_DOC = "config/store";

// Error handling helper
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Store Config
const DEFAULT_STORE_CONFIG: StoreConfig = {
  name: "CHRONOS",
  logo: "",
  homepageBackground: "https://images.unsplash.com/photo-1508685096489-7aac29145fe0?auto=format&fit=crop&q=80&w=1920",
  description: "Excelência em cada segundo. Descubra nossa coleção exclusiva de relógios que transcendem o tempo.",
  phone: "(11) 99999-9999",
  email: "contato@chronos.com.br",
  address: "Av. Paulista, 1000 - São Paulo, SP",
  instagram: "@chronos.premium",
  freeShippingEnabled: true,
  freeShippingMinAmount: 20000,
  collections: ["Luxo", "Minimalista", "Clássico", "Esportivo"],
  maintenance: {
    enabled: false,
    time: "",
    reason: ""
  },
  pixKey: "000.000.000-00",
  whatsappNumber: "5511999999999"
};

export const getStoreConfig = async (): Promise<StoreConfig> => {
  try {
    const docRef = doc(db, "config", "store");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_STORE_CONFIG, ...docSnap.data() } as StoreConfig;
    }
    return DEFAULT_STORE_CONFIG;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, CONFIG_DOC);
    return DEFAULT_STORE_CONFIG;
  }
};

export const saveStoreConfig = async (config: StoreConfig) => {
  try {
    const docRef = doc(db, "config", "store");
    await setDoc(docRef, config);
    window.dispatchEvent(new Event('storeConfigUpdated'));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CONFIG_DOC);
  }
};

// Sync version for backwards compatibility where possible (uses local cache)
let cachedConfig: StoreConfig = DEFAULT_STORE_CONFIG;
onSnapshot(doc(db, "config", "store"), (doc) => {
  if (doc.exists()) {
    cachedConfig = { ...DEFAULT_STORE_CONFIG, ...doc.data() } as StoreConfig;
    window.dispatchEvent(new Event('storeConfigUpdated'));
  }
});

export const getStoreConfigSync = (): StoreConfig => cachedConfig;

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return { ...data, id: doc.id } as Product;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    return [];
  }
};

export const saveProducts = async (products: Product[]) => {
  try {
    for (const product of products) {
      const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await setDoc(docRef, product);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
  }
};

export const saveProduct = async (product: Product) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${product.id}`);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${id}`);
  }
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    const user = auth.currentUser;
    if (!user) return [];
    
    let q;
    const userSnap = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    const userData = userSnap.data();
    
    if (userData?.role === 'admin' || userData?.role === 'dev') {
      q = query(collection(db, ORDERS_COLLECTION));
    } else {
      q = query(collection(db, ORDERS_COLLECTION), where("userId", "==", user.uid));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return { ...data, id: doc.id } as Order;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    return [];
  }
};

export const saveOrder = async (order: Order) => {
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${order.id}`);
  }
};

export const updateOrder = async (order: Order) => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, order.id), order as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${order.id}`);
  }
};

export const deleteOrder = async (id: string) => {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COLLECTION}/${id}`);
  }
};

// Users
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
    return docSnap.exists() ? (docSnap.data() as User) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${USERS_COLLECTION}/${uid}`);
    return null;
  }
};

export const updateUserProfile = async (user: User) => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${user.id}`);
  }
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem("chronos_current_user");
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem("chronos_current_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("chronos_current_user");
    signOut(auth);
  }
  window.dispatchEvent(new Event('authUpdated'));
};

// Admin functions
export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return { ...data, id: doc.id } as User;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_COLLECTION);
    return [];
  }
};

export const saveUsers = async (users: User[]) => {
  try {
    for (const user of users) {
      await setDoc(doc(db, USERS_COLLECTION, user.id), user, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, USERS_COLLECTION);
  }
};

export const saveOrders = async (orders: Order[]) => {
  try {
    for (const order of orders) {
      await setDoc(doc(db, ORDERS_COLLECTION, order.id), order, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ORDERS_COLLECTION);
  }
};

export const clearAllSessions = () => {
  localStorage.removeItem("chronos_current_user");
  signOut(auth);
  window.dispatchEvent(new Event('authUpdated'));
};
