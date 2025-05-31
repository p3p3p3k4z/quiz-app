// src/app/page.tsx (o src/pages/index.tsx si no usaste --app)

import { PrismaClient } from '@prisma/client';
import Head from 'next/head'; // Para el título de la página

// Define las interfaces para la tipificación de los datos
interface AnswerData {
  id: number;
  answer_text: string;
}

interface QuestionAnswerData {
  answer: AnswerData;
  is_correct: boolean;
}

interface QuestionData {
  id: number;
  question_text: string;
  topic: string | null;
  answers: QuestionAnswerData[];
}

// Componente principal de la página
// Este es un Server Component en el nuevo App Router de Next.js
// o un componente de página en el Pages Router con getServerSideProps
export default async function Home() {
  let questions: QuestionData[] = [];
  const prisma = new PrismaClient();

  try {
    // Busca todas las preguntas, incluyendo sus respuestas relacionadas
    // y la información de si la respuesta es correcta para esa pregunta.
    questions = await prisma.question.findMany({
      include: {
        answers: { // Incluye la relación 'answers' de QuestionAnswer
          include: {
            answer: true, // Dentro de QuestionAnswer, incluye el modelo 'Answer'
          },
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    // En un entorno de producción, podrías mostrar un mensaje de error al usuario
    // o registrar el error en un sistema de monitoreo.
  } finally {
    // Es crucial desconectar el cliente de Prisma para liberar la conexión a la base de datos.
    await prisma.$disconnect();
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12 font-sans">
      <Head>
        <title>Cuestionario de Sistemas Operativos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
        {/* Efecto de sombra y rotación para la tarjeta principal */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
        {/* Contenido principal de la tarjeta */}
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8 leading-tight">
            Cuestionario de Sistemas Operativos
          </h1>

          {questions.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">No hay preguntas disponibles. Asegúrate de que tu base de datos esté corriendo y tenga datos.</p>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="mb-8 p-6 bg-blue-50 rounded-xl shadow-md border border-blue-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-baseline">
                  {question.question_text}
                  {question.topic && (
                    <span className="ml-3 text-sm font-medium text-blue-700 px-3 py-1 bg-blue-200 rounded-full shadow-sm">
                      {question.topic}
                    </span>
                  )}
                </h2>
                <ul className="space-y-3">
                  {question.answers.map((qa) => (
                    <li
                      key={qa.answer.id}
                      className={`p-4 rounded-lg border transition-all duration-300 ease-in-out
                        ${qa.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}
                        hover:shadow-md`}
                    >
                      <span className={`text-base ${qa.is_correct ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                        {qa.answer.answer_text}
                      </span>
                      {qa.is_correct && (
                        <span className="ml-2 text-xs text-green-600 font-bold bg-green-200 px-2 py-0.5 rounded-full">
                          (Correcta)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}