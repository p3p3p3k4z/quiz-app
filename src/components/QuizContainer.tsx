// src/components/QuizContainer.tsx
'use client'; // Directiva para indicar que es un Client Component

import React, { useState, useEffect, useMemo } from 'react';
import { QuestionData } from '@/interfaces/quiz';
import QuizHeaderNav from './QuizHeaderNav';
import QuestionDisplay from './QuestionDisplay';

// Define una interfaz para los grupos de preguntas por tema
interface QuizTopic {
  topic: string;
  questions: QuestionData[];
}

interface QuizContainerProps {
  allQuestions: QuestionData[];
}

export default function QuizContainer({ allQuestions }: QuizContainerProps) {
  const [quizTopics, setQuizTopics] = useState<QuizTopic[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(new Map()); // Map<questionId, answerId>
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    if (quizTopics.length === 0) {
      setErrorMessage("No hay preguntas disponibles en la base de datos para iniciar el cuestionario.");
      return;
    }
    setQuizStarted(true);
    setCurrentTopicIndex(0); // Inicia en el primer tema
    setSelectedAnswers(new Map()); // Reinicia las respuestas seleccionadas
    setQuizCompleted(false);
    setScore(0);
    setErrorMessage(null);
  };

  const currentTopic = quizTopics[currentTopicIndex];

  const goToNextTopic = () => {
    if (currentTopicIndex < quizTopics.length - 1) {
      setCurrentTopicIndex(prevIndex => prevIndex + 1);
    } else {
      // Si es el último tema, finalizar el quiz
      submitQuiz();
    }
  };

  const goToPreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(prevIndex => prevIndex - 1);
    }
  };

  const goToTopic = (topicIndex: number) => {
    if (topicIndex >= 0 && topicIndex < quizTopics.length) {
      setCurrentTopicIndex(topicIndex);
    }
  };

  const handleAnswerSelection = (questionId: number, answerId: number) => {
    setSelectedAnswers(prev => {
      const newMap = new Map(prev);
      newMap.set(questionId, answerId);
      return newMap;
    });
  };

  const submitQuiz = () => {
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
  };

  // Renderizado condicional para errores
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12 font-sans">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 text-center">
            <h1 className="text-3xl font-extrabold text-red-600 mb-6 leading-tight">Error</h1>
            <p className="text-lg text-gray-700 mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado condicional para la pantalla de inicio del quiz (antes de empezar)
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12 font-sans">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              Cuestionario de Sistemas Operativos
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              ¡Prepárate para poner a prueba tus conocimientos!
            </p>
            <button
              onClick={startQuiz}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            >
              Iniciar Cuestionario ({allQuestions.length} Preguntas)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado condicional para la pantalla de finalización del quiz
  if (quizCompleted) {
    const totalQuestions = quizTopics.reduce((acc, topic) => acc + topic.questions.length, 0);
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12 font-sans">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
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
                setSelectedAnswers(new Map());
                setScore(0);
              }}
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            >
              Reiniciar Todo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans">
      {/* Contenedor principal de la página del quiz */}
      <div className="w-full max-w-5xl"> {/* Aumentado el max-w para dar más espacio */}
        {/* Sección superior: Título del Tema (izquierda) y Navegación (derecha) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          {/* Título del Tema */}
          <div className="text-center sm:text-left p-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-2">
              {currentTopic?.topic || 'Cargando Tema...'}
            </h1>
            <p className="text-lg md:text-xl text-gray-700">
              Esta sección evalúa tus conocimientos sobre {currentTopic?.topic?.toLowerCase() || 'conceptos generales de sistemas operativos'}.
            </p>
          </div>

          {/* Barra de navegación de temas */}
          <div className="mt-4 sm:mt-0">
            <QuizHeaderNav
              categories={quizTopics.map(t => t.topic)}
              currentCategoryIndex={currentTopicIndex}
              onTopicClick={goToTopic}
            />
          </div>
        </div>

        {/* Sección central: Preguntas */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl space-y-8">
          {currentTopic ? (
            currentTopic.questions.map((question, qIndex) => (
              <QuestionDisplay
                key={question.id}
                question={question}
                questionNumber={qIndex + 1}
                selectedAnswerId={selectedAnswers.get(question.id)}
                onSelectAnswer={handleAnswerSelection}
              />
            ))
          ) : (
            <div className="text-center text-gray-600 text-lg">
              Cargando preguntas del tema...
            </div>
          )}
        </div>

        {/* Botones de navegación de temas (debajo de las preguntas) */}
        <div className="w-full flex justify-between mt-8 p-4 bg-white rounded-xl shadow-lg">
          <button
            onClick={goToPreviousTopic}
            disabled={currentTopicIndex === 0}
            className={`bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md
              ${currentTopicIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Tema Anterior
          </button>
          {currentTopicIndex === quizTopics.length - 1 ? (
            <button
              onClick={submitQuiz}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md"
            >
              Finalizar Cuestionario
            </button>
          ) : (
            <button
              onClick={goToNextTopic}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md"
            >
              Siguiente Tema
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
