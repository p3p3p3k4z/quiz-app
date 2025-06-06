// src/app/admin/page.tsx (Server Component)

import QuizHeaderNav from '@/components/QuizHeaderNav';
import AvatarDisplay from '@/components/AvatarDisplay';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Asegura que esta página siempre se renderice en el servidor

// Define la interfaz para las props que searchParams pasará al componente
interface AdminPageProps {
  searchParams: {
    userId?: string;
    userName?: string;
    userRole?: string;
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  // Obtener los datos del usuario de los searchParams
  const userId = searchParams.userId ? parseInt(searchParams.userId) : undefined;
  const userName = searchParams.userName || undefined;
  const userRole = searchParams.userRole || undefined;

  // Validación de que los parámetros esenciales están presentes
  // Si no hay userId, userName, o el rol no es PROFESSOR, redirige al login.
  if (userId === undefined || !userName || userRole !== 'PROFESSOR') {
    console.warn('Acceso denegado a /admin: Credenciales incompletas o rol inválido para administrador.');
    redirect('/login'); // Redirige al usuario a la página de login
    return null; // Es crucial retornar null después de un redirect en Server Components
  }

  return (
    // Contenedor principal de la página, asegura que ocupe al menos toda la altura de la pantalla
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 font-sans text-gray-800 flex flex-col">
      {/* Encabezado de navegación principal con el nombre y rol del usuario */}
      <QuizHeaderNav userName={userName} userRole={userRole}>
        <AvatarDisplay userName={userName} /> {/* Muestra el avatar del usuario */}
      </QuizHeaderNav>

      <main className="flex-grow w-full px-4 py-8 flex justify-center items-center text-center">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-purple-800 mb-6 leading-tight">
            Bienvenido, Profesor {userName}!
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Este es tu panel de administración. Aquí podrás gestionar los cuestionarios y ver los resultados de los estudiantes.
            Esta es una versión básica del panel.
          </p>
          <Link
            href={`/questions?userId=${userId}&userName=${userName}&userRole=PROFESSOR`}
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
          >
            Ver Cuestionario (Solo Vista)
          </Link>
        </div>
      </main>
    </div>
  );
}
