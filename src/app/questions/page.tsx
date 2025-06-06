// src/app/questions/page.tsx (Server Component)

import prisma from '@/lib/prisma';
import { QuestionData } from '@/interfaces/quiz'; // Importa la interfaz QuestionData
import QuizContainer from '@/components/QuizContainer';
import QuizHeaderNav from '@/components/QuizHeaderNav'; // Importa el header global
import AvatarDisplay from '@/components/AvatarDisplay'; // Importa el avatar para el header
import { redirect } from 'next/navigation'; // Importa redirect para Server Components
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Asegura que esta página siempre se renderice en el servidor

// Define la interfaz para las props que searchParams pasará al componente
interface QuestionsPageProps {
  searchParams: {
    userId?: string;
    userName?: string;
    userRole?: string;
  };
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  let allQuestions: QuestionData[] = [];
  let serverErrorMessage: string | null = null;

  // Obtener los datos del usuario de los searchParams
  const userId = searchParams.userId ? parseInt(searchParams.userId) : undefined;
  const userName = searchParams.userName || undefined;
  const userRole = searchParams.userRole || undefined;

  // Validación de que los parámetros esenciales están presentes
  // Si no hay userId, userName, o el rol no es válido, redirige al login.
  if (userId === undefined || !userName || !userRole || (userRole !== 'STUDENT' && userRole !== 'PROFESSOR')) {
    console.warn('Acceso denegado a /questions: Credenciales incompletas o rol inválido.');
    redirect('/login'); // Redirige al usuario a la página de login
    return null; // Es crucial retornar null después de un redirect en Server Components
  }

  // Si el usuario es un profesor, redirige a la página de administración (no debería acceder al quiz directamente)
  if (userRole === 'PROFESSOR') {
    redirect(`/admin?userId=${userId}&userName=${userName}&userRole=${userRole}`);
    return null;
  }

  try {
    allQuestions = await prisma.question.findMany({
      include: {
        answers: {
          include: {
            answer: true,
          },
        },
      },
    });
    console.log(`[Server Component] Preguntas obtenidas de la DB: ${allQuestions.length}`);
  } catch (error: any) {
    console.error('Error al obtener preguntas de la base de datos en QuestionsPage (Server Component):', error);
    serverErrorMessage = `Error al cargar las preguntas: ${error.message || 'Error desconocido de la base de datos.'}`;
    if (error.stack) {
        console.log("Error stack:", error.stack);
    }
  }

  if (serverErrorMessage) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error del Servidor</h1>
            <p className="text-lg text-gray-700 mb-6">{serverErrorMessage}</p>
            <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                Volver al Login
            </Link>
        </div>
    );
  }

  return (
    // Contenedor principal de la página, asegura que ocupe al menos toda la altura de la pantalla
    // y establece un fondo consistente en toda la página
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 flex flex-col">
      {/* Encabezado de navegación principal con el nombre y rol del usuario */}
      <QuizHeaderNav userName={userName} userRole={userRole}>
        <AvatarDisplay userName={userName} /> {/* Muestra el avatar del usuario */}
      </QuizHeaderNav>

      {/* Contenedor principal del contenido, permite que crezca y ocupe el ancho completo */}
      <main className="flex-grow w-full px-4 py-8 flex justify-center items-start">
        {/* Pasa las preguntas y los datos del usuario al QuizContainer */}
        <QuizContainer
          allQuestions={allQuestions}
          userId={userId as number} // Asegurar que sea number
          userName={userName as string} // Asegurar que sea string
          userRole={userRole as string} // Asegurar que sea string
        />
      </main>
    </div>
  );
}
