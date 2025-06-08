// src/lib/firebase.ts
// Este archivo inicializa Firebase Auth para el entorno de Canvas,
// con manejo de configuración para desarrollo local usando la configuración del usuario.

import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'; // Aunque no se use para persistencia del quiz IA, la importación se mantiene por si acaso.

// Declaración global para las variables proporcionadas por Canvas.
// Esto le dice a TypeScript que estas variables podrían existir globalmente.
declare global {
  var __firebase_config: string | undefined;
  var __initial_auth_token: string | undefined;
  var __app_id: string | undefined;
}

let firebaseAuthInstance: Auth | null = null;
let firestoreDbInstance: Firestore | null = null;
let isAuthInitialized = false; // Bandera para asegurar que la autenticación se inicialice una vez

/**
 * Obtiene la configuración de Firebase de las variables globales de Canvas
 * o de la configuración real del usuario si se ejecuta localmente.
 * @returns {object} La configuración de Firebase.
 */
function getFirebaseConfig() {
  if (typeof __firebase_config !== 'undefined' && __firebase_config !== '{}') {
    // Si Canvas proporciona una configuración, úsala.
    try {
      const config = JSON.parse(__firebase_config);
      console.log("Usando configuración de Firebase proporcionada por Canvas.");
      return config;
    } catch (e) {
      console.error("Error al parsear __firebase_config de Canvas, usando configuración local por defecto:", e);
      // Fallback a la configuración real del usuario si hay un error de parseo de Canvas.
      return {
        apiKey: "AIzaSyAXxKJDp9FEJSlRMKO7lD3jcLhTN52DiAM",
        authDomain: "quiz-app-fd587.firebaseapp.com",
        projectId: "quiz-app-fd587",
        storageBucket: "quiz-app-fd587.firebasestorage.app",
        messagingSenderId: "146658059886",
        appId: "1:146658059886:web:3c86a57d04fc6d8507e87f",
        measurementId: "G-CYS0YBQR1R"
      };
    }
  } else {
    // Si no se está en Canvas o __firebase_config está vacío, usa la configuración real del usuario.
    console.log("No se encontró configuración de Firebase de Canvas. Usando la configuración real del usuario para desarrollo local.");
    return {
      apiKey: "AIzaSyAXxKJDp9FEJSlRMKO7lD3jcLhTN52DiAM",
      authDomain: "quiz-app-fd587.firebaseapp.com",
      projectId: "quiz-app-fd587",
      storageBucket: "quiz-app-fd587.firebasestorage.app",
      messagingSenderId: "146658059886",
      appId: "1:146658059886:web:3c86a57d04fc6d8507e87f",
      measurementId: "G-CYS0YBQR1R"
    };
  }
}

/**
 * Inicializa Firebase si aún no ha sido inicializado.
 * Maneja la autenticación inicial con token personalizado o de forma anónima.
 */
export async function initializeFirebaseClient() {
  if (isAuthInitialized) {
    console.log("Firebase ya está inicializado y autenticación procesada.");
    return;
  }

  try {
    const firebaseConfig = getFirebaseConfig();

    // Inicializa la aplicación Firebase. Asegúrate de que no se inicialice dos veces en HMR.
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log("Aplicación Firebase inicializada.");
    } else {
      app = getApp(); // Usa la app existente si ya fue inicializada (útil en HMR de Next.js)
      console.log("Usando instancia de Firebase existente.");
    }
    
    // Obtiene la instancia de autenticación
    if (!firebaseAuthInstance) { // Solo inicializar si no existe
        firebaseAuthInstance = getAuth(app);
    }

    // Inicializa Firestore si es necesario (aunque para este quiz IA simplificado no es el foco)
    if (!firestoreDbInstance) {
        firestoreDbInstance = getFirestore(app);
    }

    // Obtener el token de autenticación inicial de Canvas si está disponible
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    // Solo intentar el sign-in si la autenticación no ha sido procesada aún
    if (!isAuthInitialized) {
        if (initialAuthToken) {
            console.log("Intentando iniciar sesión con token personalizado...");
            await signInWithCustomToken(firebaseAuthInstance, initialAuthToken)
                .then(() => console.log("Inicio de sesión con token personalizado exitoso."))
                .catch(error => {
                    console.error("Error al iniciar sesión con token personalizado:", error);
                    // Si falla el token personalizado, intentar anónimo como fallback
                    signInAnonymously(firebaseAuthInstance!) // Asegura que firebaseAuthInstance no sea null
                        .then(() => console.log("Inicio de sesión anónimo exitoso como fallback."))
                        .catch(anonError => console.error("Error al iniciar sesión anónimo:", anonError));
                });
        } else {
            console.log("No se encontró token personalizado, iniciando sesión anónima...");
            await signInAnonymously(firebaseAuthInstance!) // Asegura que firebaseAuthInstance no sea null
                .then(() => console.log("Inicio de sesión anónimo exitoso."))
                .catch(error => console.error("Error al iniciar sesión anónimo:", error));
        }
        isAuthInitialized = true; // Marca la autenticación como procesada
    }
    
    // Configura un observador de estado de autenticación (opcional, para depuración/tiempo real)
    // Se recomienda hacerlo después de la inicialización para evitar problemas con HMR.
    onAuthStateChanged(firebaseAuthInstance, (user) => {
        if (user) {
            console.log("Estado de autenticación cambiado: Usuario conectado", user.uid);
        } else {
            console.log("Estado de autenticación cambiado: Usuario desconectado.");
        }
    });

  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    // Podrías establecer un estado de error global o manejarlo de otra manera.
    isAuthInitialized = false; // Asegurar que la bandera sea falsa en caso de error
    throw error;
  }
}

// Proporciona la instancia de Auth. Asegúrate de que initializeFirebaseClient() se haya llamado primero.
export function getAuthInstance(): Auth {
  if (!firebaseAuthInstance) {
      throw new Error("Firebase Auth no ha sido inicializado. Llama a initializeFirebaseClient() primero.");
  }
  return firebaseAuthInstance;
}

// Proporciona la instancia de Firestore. Asegúrate de que initializeFirebaseClient() se haya llamado primero.
export function getFirestoreInstance(): Firestore {
    if (!firestoreDbInstance) {
        throw new Error("Firestore no ha sido inicializado. Llama a initializeFirebaseClient() primero.");
    }
    return firestoreDbInstance;
}

// Verifica si la autenticación de Firebase ha completado su proceso inicial.
export function isFirebaseAuthInitialized(): boolean {
  return isAuthInitialized;
}
