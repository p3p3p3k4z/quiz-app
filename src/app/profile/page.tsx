// src/app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuizHeaderNav from '@/components/QuizHeaderNav';
import AvatarDisplay from '@/components/AvatarDisplay';
import Link from 'next/link';

// Definiciones de tipos para los datos del perfil
interface ExamResultData {
  id: number;
  examTitle: string;
  score: number;
  maxScore: number;
  createdAt: string; // Fecha de creación del resultado
}

interface UserProfileData {
  id: number;
  nombre: string;
  role: string;
  createdAt: string;
  examResults?: ExamResultData[]; // Opcional, solo para estudiantes
}

export default function ProfilePage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<{ userId: number; userName: string; userRole: string } | null>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Obtener datos de sesión de localStorage
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        setUserSession(session);
      } else {
        // Si no hay sesión, redirigir al login
        setError("No hay sesión activa. Por favor, inicie sesión.");
        const timer = setTimeout(() => router.push('/login'), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [router]);

  useEffect(() => {
    // 2. Si la sesión está cargada, obtener los datos del perfil de la API
    const fetchProfileData = async () => {
      if (!userSession?.userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/profile', {
          headers: {
            'X-User-Id': userSession.userId.toString(),
            'X-User-Role': userSession.userRole, // Para validación en el backend
          },
        });
        const data = await response.json();

        if (response.ok) {
          setProfileData(data.profile);
        } else {
          setError(data.message || 'Error al cargar el perfil.');
          console.error('Error fetching profile:', data.message);
        }
      } catch (err: any) {
        setError('Error de conexión al cargar el perfil.');
        console.error('Network error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userSession) {
      fetchProfileData();
    }
  }, [userSession]);

  // Mensaje de carga inicial o redirección
  if (!userSession) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <p className="text-xl text-gray-700">Cargando sesión o redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 flex flex-col">
      <QuizHeaderNav userName={userSession.userName} userRole={userSession.userRole}>
        <AvatarDisplay userName={userSession.userName} />
      </QuizHeaderNav>

      <main className="flex-grow w-full px-4 py-8 flex justify-center items-start">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <h1 className="text-4xl font-extrabold text-indigo-800 mb-6 text-center">
            Mi Perfil
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <strong className="font-bold">¡Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">Cargando datos del perfil...</p>
              <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : profileData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-500">ID de Usuario</p>
                  <p className="text-lg font-semibold text-gray-900">{profileData.id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Nombre de Usuario</p>
                  <p className="text-lg font-semibold text-gray-900">{profileData.nombre}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Rol</p>
                  <p className="text-lg font-semibold text-gray-900">{profileData.role}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Miembro desde</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(profileData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {profileData.role === 'STUDENT' && profileData.examResults && profileData.examResults.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Mis Calificaciones</h2>
                  <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                        <tr>
                          <th className="py-3 px-6 text-left">Título del Examen</th>
                          <th className="py-3 px-6 text-left">Calificación</th>
                          <th className="py-3 px-6 text-left">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm font-light">
                        {profileData.examResults.map((result) => (
                          <tr key={result.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-6 text-left">{result.examTitle}</td>
                            <td className="py-3 px-6 text-left">{result.score} / {result.maxScore}</td>
                            <td className="py-3 px-6 text-left">
                              {new Date(result.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {profileData.role === 'STUDENT' && (!profileData.examResults || profileData.examResults.length === 0) && (
                <div className="mt-8 text-center text-gray-600">
                  <p>Aún no tienes calificaciones registradas.</p>
                  <Link href="/questions" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg">
                    Ir al Cuestionario
                  </Link>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">No se pudieron cargar los datos del perfil.</p>
              <Link href="/login" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg">
                Volver al Login
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
