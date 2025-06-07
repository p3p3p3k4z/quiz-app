// src/components/QuizHeaderNav.tsx
'use client'; // Directiva para indicar que es un Client Component

import React from 'react';
import { useRouter } from 'next/navigation'; // Importa useRouter para la navegación
import Link from 'next/link'; // Importa Link para la navegación

interface QuizHeaderNavProps {
  userName?: string;
  userRole?: string;
  children?: React.ReactNode; // Para el AvatarDisplay (si lo usas como children)
  // Las props de navegación por categorías ya no se usan directamente aquí para renderizar,
  // solo se mantienen si otros componentes las pasan para una lógica interna que no sea de UI.
  categories?: string[];
  currentCategoryIndex?: number;
  onTopicClick?: (index: number) => void;
}

export default function QuizHeaderNav({ userName, userRole, children, categories, currentCategoryIndex, onTopicClick }: QuizHeaderNavProps) {
  const router = useRouter();

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      // Limpia cualquier estado de sesión en el cliente (localStorage)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userSession'); // Limpia la sesión completa
        // Ya no es necesario limpiar userId, userName, userRole individualmente si se guarda en 'userSession'
      }
      // Redirige al usuario a la página de login
      router.push('/login');
    } catch (error) {
      console.error('Error al intentar cerrar sesión:', error);
      // Podrías mostrar un mensaje de error al usuario
    }
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10 rounded-b-xl">
      <div className="flex items-center mb-4 sm:mb-0">
        <Link href="/" className="text-2xl font-bold text-indigo-700 hover:text-indigo-900 transition-colors duration-200">
          Cuestionario SO
        </Link>
        <nav className="ml-6 flex space-x-4">
          {/* Navegación condicional basada en el rol del usuario */}
          {userRole === 'STUDENT' && (
            <Link href="/questions" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200 font-medium">
              Cuestionario
            </Link>
          )}
          {userRole === 'PROFESSOR' && (
            <Link href="/admin" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200 font-medium">
              Panel de Profesor
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {/* Enlace al perfil de usuario */}
        {userName && (
          <Link href="/profile" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
            {children} {/* Renderiza el AvatarDisplay */}
            <span className="text-gray-700 font-semibold text-lg hidden sm:inline">
              Hola, {userName}
            </span>
          </Link>
        )}

        {/* Botón de cerrar sesión */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
