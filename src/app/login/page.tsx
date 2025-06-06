// src/app/login/page.tsx
'use client'; // Indicar que es un Client Component

import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true); // Estado para alternar entre login y registro

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12 font-sans">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
        {/* Efecto de sombra y rotación para la tarjeta principal */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>

        {/* Contenido principal de la tarjeta */}
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 rounded-xl">
          <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8 leading-tight rounded-xl">
            {isLoginView ? 'Acceso de Usuarios' : 'Crear Nueva Cuenta'}
          </h1>

          {/* Botones para alternar entre Login y Registro */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setIsLoginView(true)}
              className={`px-6 py-2 rounded-l-lg font-semibold transition-colors duration-300
                ${isLoginView ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              Login
            </button>
            <button
              onClick={() => setIsLoginView(false)}
              className={`px-6 py-2 rounded-r-lg font-semibold transition-colors duration-300
                ${!isLoginView ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              Registro
            </button>
          </div>

          {/* Renderizado condicional del formulario */}
          {isLoginView ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}
