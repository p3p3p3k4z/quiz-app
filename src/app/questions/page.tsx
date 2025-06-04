// src/app/questions/page.tsx (Server Component)

import prisma from '@/lib/prisma';
import { QuestionData } from '@/interfaces/quiz';
import QuizContainer from '@/components/QuizContainer';
// import { redirect } from 'next/navigation'; // ELIMINADO: Ya no necesitamos redirigir desde el servidor

export const dynamic = 'force-dynamic';

export default async function QuestionsPage() {
  let allQuestions: QuestionData[] = [];
  let errorMessage: string | null = null;

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
    errorMessage = `Error al cargar las preguntas: ${error.message || 'Error desconocido de la base de datos.'}`;
    if (error.stack) {
        console.log("Error stack:", error.stack);
    }
  }

  // No hay verificación de autenticación aquí.
  // El nombre de usuario se pasará como un query param a QuizContainer si viene del login.
  return <QuizContainer allQuestions={allQuestions} />;
}
