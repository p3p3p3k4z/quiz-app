// src/components/QuizContainer.tsx
'use client'; // Directiva para indicar que es un Client Component

import React, { useState, useEffect } from 'react'; // useMemo eliminado, ya no se usa
import { QuestionData } from '@/interfaces/quiz';
import QuestionDisplay from './QuestionDisplay';
import { useRouter } from 'next/navigation'; // Importa useRouter para la redirección

// Define una interfaz para los grupos de preguntas por tema
interface QuizTopic {
  topic: string;
  questions: QuestionData[];
}

interface QuizContainerProps {
  allQuestions: QuestionData[];
  // Se reciben userId, userName, userRole desde questions/page.tsx
  userId: number;
  userName: string;
  userRole: string;
}

export default function QuizContainer({ allQuestions, userId, userName, userRole }: QuizContainerProps) {
  const router = useRouter();
  const [quizTopics, setQuizTopics] = useState<QuizTopic[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentQuestionIndexInTopic, setCurrentQuestionIndexInTopic] = useState(0); // Para preguntas dentro del tema
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(new Map()); // Map<questionId, answerId>
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Efecto para verificar los datos de usuario al cargar el componente
  useEffect(() => {
    // Si los datos de usuario no son válidos para un estudiante, redirige al login
    // Permite que un profesor vea el quiz, pero no le dejará enviar resultados ni iniciar el quiz
    if (!userId || !userName || !userRole || (userRole !== 'STUDENT' && userRole !== 'PROFESSOR')) {
      setErrorMessage("Sesión no válida o caducada. Por favor, inicie sesión nuevamente.");
      // Redirigir al login después de un breve retraso para que el mensaje sea visible
      const timer = setTimeout(() => router.push('/login'), 3000);
      return () => clearTimeout(timer); // Limpiar el temporizador si el componente se desmonta
    }
     // Si es profesor, permite la visualización pero deshabilita iniciar/finalizar quiz
    if (userRole === 'PROFESSOR') {
      setErrorMessage("Como profesor, solo puedes visualizar el cuestionario. Para presentar, inicia sesión como estudiante.");
      // No redirigimos al profesor, solo le mostramos el mensaje
    }
  }, [userId, userName, userRole, router]);


  // Función para barajar un array (algoritmo de Fisher-Yates)
  const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  // Prepara los temas y las preguntas al cargar el componente
  useEffect(() => {
    if (allQuestions.length > 0) {
      const groupedQuestions = allQuestions.reduce((acc, question) => {
        const topicName = question.topic || 'General';
        if (!acc[topicName]) {
          acc[topicName] = [];
        }
        acc[topicName].push(question);
        return acc;
      }, {} as Record<string, QuestionData[]>);

      // Convertir el objeto agrupado a un array de QuizTopic
      const topicsArray: QuizTopic[] = Object.keys(groupedQuestions).map(topic => ({
        topic: topic,
        questions: shuffleArray([...groupedQuestions[topic]]), // Barajar preguntas dentro de cada tema
      }));
      setQuizTopics(topicsArray);
    } else {
      setErrorMessage("No hay preguntas disponibles en la base de datos para iniciar el cuestionario.");
    }
  }, [allQuestions]);

  // Inicia el quiz
  const startQuiz = () => {
     if (userRole === 'PROFESSOR') { // Evitar que el profesor inicie el quiz
      setErrorMessage("Los profesores no pueden iniciar el cuestionario. Inicia sesión como estudiante.");
      return;
    }
    if (quizTopics.length === 0) {
      setErrorMessage("No hay preguntas disponibles en la base de datos para iniciar el cuestionario.");
      return;
    }
    setQuizStarted(true);
    setCurrentTopicIndex(0); // Inicia en el primer tema
    setCurrentQuestionIndexInTopic(0); // Inicia en la primera pregunta del primer tema
    setSelectedAnswers(new Map()); // Reinicia las respuestas seleccionadas
    setQuizCompleted(false);
    setScore(0);
    setErrorMessage(null);
  };

  const currentTopic = quizTopics[currentTopicIndex];
  const currentQuestion = currentTopic?.questions[currentQuestionIndexInTopic]; // Obtiene la pregunta actual

  const goToNext = () => {
    if (currentTopicIndex === -1 || !currentTopic) return;

    // Si hay más preguntas en el tema actual
    if (currentQuestionIndexInTopic < currentTopic.questions.length - 1) {
      setCurrentQuestionIndexInTopic(prevIndex => prevIndex + 1);
    }
    // Si es la última pregunta del tema actual, pasar al siguiente tema
    else if (currentTopicIndex < quizTopics.length - 1) {
      setCurrentTopicIndex(prevIndex => prevIndex + 1);
      setCurrentQuestionIndexInTopic(0); // Primera pregunta del nuevo tema
    }
    // Si es la última pregunta del último tema, finalizar el quiz
    else {
      submitQuiz();
    }
  };

  const goToPrevious = () => {
    if (currentTopicIndex === -1 || !currentTopic) return;

    // Si hay preguntas anteriores en el tema actual
    if (currentQuestionIndexInTopic > 0) {
      setCurrentQuestionIndexInTopic(prevIndex => prevIndex - 1);
    }
    // Si es la primera pregunta del tema actual, pasar al último pregunta del tema anterior
    else if (currentTopicIndex > 0) {
      const prevTopicIndex = currentTopicIndex - 1;
      const prevTopic = quizTopics[prevTopicIndex];
      setCurrentTopicIndex(prevTopicIndex);
      setCurrentQuestionIndexInTopic(prevTopic.questions.length - 1); // Última pregunta del tema anterior
    }
  };

  const goToTopic = (topicIndex: number) => {
    if (topicIndex >= 0 && topicIndex < quizTopics.length) {
      setCurrentTopicIndex(topicIndex);
      setCurrentQuestionIndexInTopic(0); // Siempre ir a la primera pregunta del tema seleccionado
    }
  };

  const handleAnswerSelection = (questionId: number, answerId: number) => {
    setSelectedAnswers(prev => {
      const newMap = new Map(prev);
      newMap.set(questionId, answerId);
      return newMap;
    });
  };

  const submitQuiz = async () => {
    if (userRole === 'PROFESSOR') { // Evitar que el profesor envíe resultados
      setErrorMessage("Los profesores no pueden enviar resultados del cuestionario.");
      return;
    }
    // Verificar que los datos del usuario estén disponibles
    if (userId === undefined || userName === undefined || userRole === undefined) {
      setErrorMessage("No se pudo enviar el quiz: Faltan datos de usuario. Por favor, inicie sesión.");
      router.push('/login'); // Redirige al login si no hay datos de usuario válidos
      return;
    }

    let correctCount = 0;
    quizTopics.forEach(topic => {
      topic.questions.forEach(q => {
        const selectedAnswerId = selectedAnswers.get(q.id);
        if (selectedAnswerId !== undefined) {
          const correctAnswer = q.answers.find(a => a.is_correct);
          if (correctAnswer && correctAnswer.answer.id === selectedAnswerId) {
            correctCount++;
          }
        }
      });
    });
    setScore(correctCount);
    setQuizCompleted(true);

    // Guardar el resultado en la base de datos
    try {
      const totalQuestionsCount = quizTopics.reduce((acc, topic) => acc + topic.questions.length, 0);
      const response = await fetch('/api/exam-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: userId,
          examTitle: 'Cuestionario de Sistemas Operativos',
          score: correctCount,
          maxScore: totalQuestionsCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al guardar resultados del examen:", errorData.message);
        setErrorMessage(`Error al guardar resultados: ${errorData.message}`);
      } else {
        console.log("Resultados del examen guardados exitosamente.");
      }
    } catch (error) {
      console.error("Error de red al guardar resultados del examen:", error);
      setErrorMessage("Error de conexión al guardar resultados.");
    }
  };

  // Renderizado condicional para errores
  if (errorMessage) {
    return (
      // Aplicar fondo blanco y sombra para consistencia
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl text-center text-gray-600 text-lg mx-auto w-full max-w-xl">
        <h1 className="text-3xl font-extrabold text-red-600 mb-6 leading-tight">Error</h1>
        <p className="text-lg text-gray-700 mb-8">{errorMessage}</p>
        {userRole !== 'PROFESSOR' && (
          <button
            onClick={() => router.push('/login')} // Redirigir al login
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
          >
            Ir al Login
          </button>
        )}
      </div>
    );
  }

  // Renderizado condicional para la pantalla de inicio del quiz (antes de empezar)
  if (!quizStarted) {
    const totalQuestionsCount = allQuestions.length;
    return (
      // Aplicar fondo blanco y sombra para consistencia
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl text-center text-gray-600 text-lg mx-auto w-full max-w-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Cuestionario de Sistemas Operativos
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            ¡Prepárate para poner a prueba tus conocimientos!
          </p>
          {userRole === 'STUDENT' ? (
            <button
              onClick={startQuiz}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            >
              Iniciar Cuestionario ({totalQuestionsCount} Preguntas)
            </button>
          ) : (
            <p className="text-lg text-gray-600">Puedes revisar las preguntas a continuación.</p>
          )}
        </div>
      </div>
    );
  }

  // Renderizado condicional para la pantalla de finalización del quiz
  if (quizCompleted) {
    const totalQuestions = quizTopics.reduce((acc, topic) => acc + topic.questions.length, 0);
    return (
      // Aplicar fondo blanco y sombra para consistencia
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl text-center text-gray-600 text-lg mx-auto w-full max-w-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Cuestionario Finalizado
          </h1>
          <p className="text-2xl text-gray-700 mb-4">
            Tu puntuación: <span className="font-bold text-blue-600">{score}</span> de <span className="font-bold">{totalQuestions}</span>
          </p>
          <p className="text-lg text-gray-600 mb-8">
            ¡Gracias por participar!
          </p>
          <button
            onClick={() => setQuizStarted(false)} // Volver a la pantalla de inicio
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg mr-4"
          >
            Volver a Intentar
          </button>
          <button
            onClick={() => {
              setQuizStarted(false);
              setQuizCompleted(false);
              setQuizTopics([]); // Reiniciar temas
              setCurrentTopicIndex(0);
              setCurrentQuestionIndexInTopic(0);
              setSelectedAnswers(new Map());
              setScore(0);
              router.push('/'); // Redirige al incio después de reiniciar
            }}
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
          >
            Salir
          </button>
        </div>
      </div>
    );
  }

  return (
    // Contenedor principal del quiz, flex para columnas, ocupa todo el ancho disponible.
    // Añadimos fondo blanco y sombra para que se vea como un bloque de contenido destacado.
    <div className="w-full flex flex-col lg:flex-row items-start justify-center p-4 font-sans bg-white rounded-3xl shadow-xl max-w-7xl mx-auto">
      {/* Columna Izquierda: Información de la Categoría/Tema */}
      <div className="w-full lg:w-1/3 text-center lg:text-left p-8 lg:p-12 flex-shrink-0">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {currentTopic?.topic || 'Cargando Tema...'}
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10">
          Esta sección evalúa tus conocimientos sobre {currentTopic?.topic?.toLowerCase() || 'conceptos generales de sistemas operativos'}.
        </p>
      </div>

      {/* Columna Derecha: Navegación por Temas y Preguntas */}
      <div className="w-full lg:w-2/3 mt-8 lg:mt-0 lg:ml-10 lg:gap-x-8"> {/* Ajusta el ml y el gap */}
        {/* Barra de navegación de temas (numerical navigation) */}
        <div className="w-full bg-white shadow-lg rounded-xl p-4 mb-8">
          <div className="flex flex-wrap justify-center sm:justify-between items-center gap-2 md:gap-4">
            {quizTopics.map((topic, index) => (
              <button
                key={topic.topic} // Usar el nombre del tema como key
                onClick={() => goToTopic(index)}
                className={`flex flex-col items-center text-center px-3 py-2 rounded-lg transition-all duration-300 ease-in-out
                  ${index <= currentTopicIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'}
                `}
                aria-current={index === currentTopicIndex ? 'page' : undefined}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1
                  ${index === currentTopicIndex ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'}
                  ${index < currentTopicIndex ? 'bg-blue-100 text-blue-600' : ''}
                `}>
                  {index + 1}
                </div>
                {/* Eliminamos whitespace-nowrap y añadimos text-center para que el texto se ajuste y se centre */}
                <span className="text-xs md:text-sm text-center">{topic.topic}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Muestra la pregunta actual */}
        {currentQuestion ? (
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndexInTopic + 1} // Número de pregunta dentro del tema
            selectedAnswerId={selectedAnswers.get(currentQuestion.id)}
            onSelectAnswer={handleAnswerSelection}
          />
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl text-center text-gray-600 text-lg">
            Cargando pregunta...
          </div>
        )}

        {/* Botones de navegación (Anterior/Siguiente/Finalizar) */}
        <div className="flex justify-between mt-8 p-4 bg-white rounded-xl shadow-lg">
          <button
            onClick={goToPrevious}
            disabled={currentTopicIndex === 0 && currentQuestionIndexInTopic === 0}
            className={`bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md
              ${(currentTopicIndex === 0 && currentQuestionIndexInTopic === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Anterior
          </button>
          {currentTopicIndex === quizTopics.length - 1 &&
           currentQuestionIndexInTopic === (currentTopic?.questions.length || 0) - 1 ? ( // Verifica la última pregunta del último tema
            <button
              onClick={submitQuiz}
              disabled={userRole === 'PROFESSOR'} // Deshabilitar para profesores
              className={`font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md
                ${userRole === 'PROFESSOR' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}
              `}
            >
              Finalizar Cuestionario
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md"
            >
              Siguiente Paso
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
