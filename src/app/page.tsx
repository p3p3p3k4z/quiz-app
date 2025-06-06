// src/app/page.tsx
'use client'; // Esta directiva indica que es un Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AvatarDisplay from '@/components/AvatarDisplay'; // Importa el componente cliente para avatares
import { UserSessionData } from '@/interfaces/user'; // Importa UserSessionData desde user.ts

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar el login como invitado (estudiante1)
  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null); // Limpiar errores previos

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Credenciales de 'estudiante1' para el login de invitado
        body: JSON.stringify({
          username: 'estudiante1',
          password: 'passestudiante',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Almacenar los datos de la sesión en localStorage
        const userSession: UserSessionData = {
          userId: data.user.id,
          userName: data.user.nombre,
          userRole: data.user.role,
        };
        if (typeof window !== 'undefined') { // Asegurarse de que estamos en el lado del cliente
          localStorage.setItem('userSession', JSON.stringify(userSession));
        }
        router.push(`/questions?userId=${data.user.id}&userName=${data.user.nombre}&userRole=${data.user.role}`);
      } else {
        // Mostrar error si el login falla
        setError(data.message || 'Error al iniciar sesión como invitado.');
        console.error('Error al iniciar sesión como invitado:', data.message);
      }
    } catch (err: any) {
      // Capturar errores de red o del fetch
      setError('Error de conexión. Inténtalo de nuevo.');
      console.error('Error de red/petición al iniciar sesión como invitado:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row items-center justify-center p-4 font-sans">
      {/* Tailwind CSS para la fuente Inter (si no está globalmente) */}
      <script src="https://cdn.tailwindcss.com"></script>
      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Contenido principal izquierdo */}
      <div className="flex-1 max-w-2xl text-center lg:text-left p-8 lg:p-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Encuentra problemas de seguridad <span className="text-blue-600">antes que los atacantes</span> lo hagan.
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10">
          Descubre vulnerabilidades ocultas, evalúa tu exposición al riesgo y fortalece las defensas antes de que los ciberdelincuentes exploten las debilidades. ¿Estás preparado?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          {/* Botón para Iniciar Sesión (Redirige a la página de login completa) */}
          <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors duration-300 shadow-lg text-xl">
            Iniciar Sesión
          </Link>
          {/* Botón para Empezar Cuestionario como Invitado (Activa la función de login de invitado) */}
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className={`inline-block font-bold py-4 px-8 rounded-xl transition-colors duration-300 shadow-lg text-xl
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}
            `}
          >
            {loading ? 'Cargando...' : 'Empezar Cuestionario (Invitado)'}
          </button>
        </div>
        {/* Mensaje de error para el login de invitado */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mt-6" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
      </div>

      {/* Sección derecha con fondo oscuro */}
      <div className="flex-1 max-w-md lg:max-w-xl bg-gradient-to-br from-purple-800 to-red-800 text-white rounded-3xl p-8 md:p-10 shadow-xl mt-10 lg:mt-0 lg:ml-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
          ¡Haz el cuestionario de evaluación de riesgos de 4 minutos y obtén un informe personalizado de tu ciberseguridad!
        </h2>
        {/* Usar el nuevo Client Component para los avatares */}
        <AvatarDisplay />
      </div>
    </div>
  );
}
