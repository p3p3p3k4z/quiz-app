// src/components/RegisterForm.tsx
'use client';

import React, { useState } from 'react';

interface RegisterFormProps {
  onToggleForm: () => void; // Para cambiar al formulario de login
}

export default function RegisterForm({ onToggleForm }: RegisterFormProps) {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setNombre('');
        setPassword('');
        setConfirmPassword('');
        onToggleForm(); // Volver al login después del registro exitoso
      } else {
        alert(data.message || 'Error al registrar usuario.');
      }
    } catch (err) {
      alert('Error de red o del servidor.');
      console.error('Register error:', err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Registrarse</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-nombre" className="block text-sm font-medium text-gray-700">Nombre de Usuario:</label>
          <input
            type="text"
            id="reg-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">Contraseña:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
        >
          Registrarse
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <button onClick={onToggleForm} className="text-blue-600 hover:underline font-medium">
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
}
