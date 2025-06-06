// src/components/LoginForm.tsx
'use client'; // Indicar que es un Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserSessionData } from '@/interfaces/user'; // Importa la interfaz UserSessionData desde user.ts

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Limpiar errores previos

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Almacenar los datos de la sesión en localStorage
        const userSession: UserSessionData = {
          userId: data.user.id,
          userName: data.user.nombre,
          userRole: data.user.role,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('userSession', JSON.stringify(userSession));
        }

        // Redirigir según el rol del usuario
        if (userSession.userRole === 'STUDENT') {
          router.push(`/questions?userId=${userSession.userId}&userName=${userSession.userName}&userRole=${userSession.userRole}`);
        } else if (userSession.userRole === 'PROFESSOR') {
          router.push(`/admin?userId=${userSession.userId}&userName=${userSession.userName}&userRole=${userSession.userRole}`);
        } else {
          // Rol desconocido, manejar como error o redirigir a una página predeterminada
          setError('Rol de usuario desconocido. Contacta al administrador.');
          console.error('Rol de usuario desconocido:', userSession.userRole);
        }
      } else {
        setError(data.message || 'Error de autenticación.');
      }
    } catch (err: any) {
      console.error('Error durante el login:', err);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Nombre de Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}
          `}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </div>
    </form>
  );
}
