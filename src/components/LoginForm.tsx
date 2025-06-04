// src/components/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onToggleForm: () => void; // Para cambiar al formulario de registro
}

export default function LoginForm({ onToggleForm }: LoginFormProps) {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirigir al cuestionario con el nombre de usuario como query param
        // ADVERTENCIA: Esto NO es una gestión de sesión segura. Solo para ejemplo.
        router.push(`/questions?user=${encodeURIComponent(data.userName)}`);
      } else {
        // Mostrar un mensaje simple en el navegador (no usar alert() en producción)
        alert(data.message || 'Error al iniciar sesión.');
      }
    } catch (err) {
      alert('Error de red o del servidor.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre de Usuario:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
        >
          Iniciar Sesión
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <button onClick={onToggleForm} className="text-blue-600 hover:underline font-medium">
          Regístrate aquí
        </button>
      </p>
    </div>
  );
}
