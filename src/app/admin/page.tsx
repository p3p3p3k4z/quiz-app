// src/app/admin/page.tsx
'use client'; // ¡Importante! Convertido a Client Component

import React, { useState, useEffect } from 'react';
import QuizHeaderNav from '@/components/QuizHeaderNav';
import AvatarDisplay from '@/components/AvatarDisplay';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentCrudModal from '@/components/StudentCrudModal'; // Importa el modal

// Definiciones de tipos para los datos que esperamos
interface UserData {
  id: number;
  nombre: string;
  password?: string; // Solo para edición, no se muestra
  role: string;
  createdAt: string; // O Date
  updatedAt: string; // O Date
}

interface ExamResultData {
  id: number;
  examTitle: string;
  score: number;
  maxScore: number;
  createdAt: string; // O Date
  studentId: number;
}

interface StudentWithResults extends UserData {
  examResults: ExamResultData[];
}

export default function AdminPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [students, setStudents] = useState<StudentWithResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<UserData | null>(null); // Estudiante para editar o null para añadir

  // Efecto para obtener datos de sesión y validar el rol al cargar la página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        const parsedUserId = parseInt(sessionData.userId, 10);

        setUserId(parsedUserId);
        setUserName(sessionData.userName);
        setUserRole(sessionData.userRole);

        // Si no es profesor, redirigir al login
        if (sessionData.userRole !== 'PROFESSOR') {
          console.warn('Acceso denegado: Rol no autorizado para /admin.');
          router.push('/login');
          return;
        }
      } else {
        // Si no hay sesión, redirigir al login
        console.warn('Acceso denegado: No hay sesión activa para /admin.');
        router.push('/login');
        return;
      }
    }
  }, [router]);

  // Efecto para cargar los datos de los estudiantes solo si el rol es PROFESSOR
  useEffect(() => {
    if (userRole === 'PROFESSOR' && userId !== undefined) {
      fetchStudents();
    } else if (userRole && userRole !== 'PROFESSOR') {
      // Si el rol no es PROFESSOR y ya se ha cargado (no undefined), dejamos que el primer useEffect maneje la redirección.
      // Aquí simplemente no hacemos fetch.
      setLoading(false);
    }
  }, [userRole, userId]); // Dependencias: userRole y userId

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/students', {
        headers: {
          'X-User-Id': userId!.toString(), // Pasa el userId como un header
          'X-User-Role': userRole!, // Pasa el userRole como un header
        },
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(data.students);
      } else {
        setError(data.message || 'Error al cargar estudiantes.');
        console.error('Error fetching students:', data.message);
      }
    } catch (err: any) {
      setError('Error de conexión al cargar estudiantes.');
      console.error('Network error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejadores para el modal CRUD
  const handleAddStudent = () => {
    setCurrentStudent(null); // Para añadir un nuevo estudiante
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: UserData) => {
    setCurrentStudent(student); // Para editar un estudiante existente
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: number, studentName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${studentName}? Esta acción es irreversible.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json', // Mantenemos el content-type aunque no enviemos body
          'X-User-Id': userId!.toString(), // ¡AQUÍ ESTÁ EL CAMBIO! Pasamos el userId en el header
          'X-User-Role': userRole!,   // ¡AQUÍ ESTÁ EL CAMBIO! Pasamos el userRole en el header
        },
        // ¡Eliminamos el body para DELETE!
        // body: JSON.stringify({ // Pasamos la autorización en el body para DELETE en Next.js
        //   professorId: userId!,
        //   professorRole: userRole!,
        // })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Estudiante eliminado con éxito.');
        fetchStudents(); // Recargar la lista
      } else {
        setError(data.message || 'Error al eliminar estudiante.');
        console.error('Error deleting student:', data.message);
      }
    } catch (err: any) {
      setError('Error de conexión al eliminar estudiante.');
      console.error('Network error deleting student:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentStudent(null);
    fetchStudents(); // Recargar los estudiantes después de una operación CRUD
  };

  // Si no hay userName o userRole (sesión no cargada o no autorizada aún), muestra un mensaje de carga/redirección
  if (!userName || !userRole) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <p className="text-xl text-gray-700">Cargando sesión o redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 font-sans text-gray-800 flex flex-col">
      <QuizHeaderNav userName={userName} userRole={userRole}>
        <AvatarDisplay userName={userName} />
      </QuizHeaderNav>

      <main className="flex-grow w-full px-4 py-8 flex justify-center items-start">
        <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <h1 className="text-4xl font-extrabold text-purple-800 mb-6 text-center">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto text-center">
            Desde aquí puedes gestionar los alumnos, sus preguntas y revisar sus resultados.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <strong className="font-bold">¡Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">Cargando datos de estudiantes...</p>
              <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Sección de Gestión de Alumnos */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Gestión de Alumnos</h2>
                  <button
                    onClick={handleAddStudent}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md"
                  >
                    Añadir Nuevo Alumno
                  </button>
                </div>
                {students.length === 0 ? (
                  <p className="text-gray-600 text-center">No hay estudiantes registrados aún.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                        <tr>
                          <th className="py-3 px-6 text-left">ID</th>
                          <th className="py-3 px-6 text-left">Nombre</th>
                          <th className="py-3 px-6 text-left">Rol</th>
                          <th className="py-3 px-6 text-left">Calificación Promedio</th>
                          <th className="py-3 px-6 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm font-light">
                        {students.map((student) => {
                          const totalScore = student.examResults.reduce((sum, result) => sum + result.score, 0);
                          const totalMaxScore = student.examResults.reduce((sum, result) => sum + result.maxScore, 0);
                          const averageGrade = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(2) : 'N/A';

                          return (
                            <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-6 text-left whitespace-nowrap">{student.id}</td>
                              <td className="py-3 px-6 text-left">{student.nombre}</td>
                              <td className="py-3 px-6 text-left">{student.role}</td>
                              <td className="py-3 px-6 text-left">{averageGrade}%</td>
                              <td className="py-3 px-6 text-center">
                                <div className="flex item-center justify-center space-x-2">
                                  <button
                                    onClick={() => handleEditStudent(student)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-xs transition-colors duration-200"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudent(student.id, student.nombre)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-xs transition-colors duration-200"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Sección de Acciones Adicionales 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                <Link href="#" className="block p-6 bg-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                  <h2 className="text-2xl font-semibold mb-3">
                    Gestionar Preguntas (Futuro)
                  </h2>
                  <p className="text-indigo-100">Añade, edita o elimina preguntas para los cuestionarios.</p>
                </Link>
                <Link href="#" className="block p-6 bg-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                  <h2 className="text-2xl font-semibold mb-3">
                    Detalle de Resultados (Futuro)
                  </h2>
                  <p className="text-pink-100">Revisa las calificaciones detalladas y el progreso de tus estudiantes.</p>
                </Link>
              </div>*/}
            </>
          )}
        </div>
      </main>

      {/* Modal para añadir/editar estudiantes */}
      {isModalOpen && (
        <StudentCrudModal
          student={currentStudent}
          onClose={handleModalClose}
          professorUserId={userId!} // Se envía el ID del profesor para autenticación en la API
          professorUserRole={userRole!} // Se envía el rol del profesor para autenticación en la API
        />
      )}
    </div>
  );
}
