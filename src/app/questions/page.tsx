// src/app/questions/page.tsx (Server Component)

import prisma from '@/lib/prisma';
import { QuestionData } from '@/interfaces/quiz';
import QuizContainer from '@/components/QuizContainer'; // Importa el nuevo QuizContainer

export const dynamic = 'force-dynamic'; // Asegura que esta página siempre se renderice en el servidor

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
    console.log("Error object:", error);
    if (error.stack) {
        console.log("Error stack:", error.stack);
    }
  }

  // Pasa todas las preguntas (o un array vacío si hay error) al Client Component
  return <QuizContainer allQuestions={allQuestions} />;
}
