// src/interfaces/user.ts

// Define la interfaz para los datos de sesión del usuario
export interface UserSessionData {
  userId: number;
  userName: string;
  userRole: string; // 'STUDENT' o 'PROFESSOR'
}
