// src/components/QuizClientComponent.tsx
'use client'; // Directiva para indicar que es un Client Component

import React, { useState, useEffect, useMemo } from 'react';
import { QuestionData } from '@/interfaces/quiz'; // Importa las interfaces

interface QuizClientComponentProps {
  allQuestions: QuestionData[];
}

export default function QuizClientComponent({ allQuestions }: QuizClientComponentProps) {
  const [quizQuestions, setQuizQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

  // Memoiza la selección de preguntas para que solo se haga una vez al iniciar el quiz
  const selectRandomQuestions = () => {
    // Ya no hay restricción de 10 preguntas, usa todas las disponibles
    if (allQuestions.length === 0) {
      setErrorMessage("No hay preguntas disponibles en la base de datos para iniciar el cuestionario.");
      return;
    }
    const shuffled = shuffleArray([...allQuestions]); // Copia para no mutar el original
    setQuizQuestions(shuffled); // Usa todas las preguntas disponibles
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Map()); // Reinicia las respuestas seleccionadas
    setQuizCompleted(false);
    setScore(0);
    setErrorMessage(null);
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
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
    quizQuestions.forEach(q => {
      const selectedAnswerId = selectedAnswers.get(q.id);
      if (selectedAnswerId !== undefined) {
        const correctAnswer = q.answers.find(a => a.is_correct);
        if (correctAnswer && correctAnswer.answer.id === selectedAnswerId) {
          correctCount++;
        }
      }
    });
    setScore(correctCount);
    setQuizCompleted(true);
  };

  // Renderizado condicional
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12 font-sans">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 text-center">
            <h1 className="text-3xl font-extrabold text-red-600 mb-6 leading-tight">Error</h1>
            <p className="text-lg text-gray-700 mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()} // Recargar para intentar de nuevo
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={selectRandomQuestions}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            >
              Iniciar Cuestionario ({allQuestions.length} Preguntas Aleatorias)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12 font-sans">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              Cuestionario Finalizado
            </h1>
            <p className="text-2xl text-gray-700 mb-4">
              Tu puntuación: <span className="font-bold text-blue-600">{score}</span> de <span className="font-bold">{quizQuestions.length}</span>
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
                setQuizQuestions([]);
                setCurrentQuestionIndex(0);
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
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12 font-sans">
      <div className="relative py-3 sm:max-w-3xl sm:mx-auto w-full px-4">
        {/* Barra de navegación de preguntas en la parte superior */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-lg flex flex-wrap justify-center gap-2">
          {quizQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg transition-colors duration-200 ease-in-out
                ${index === currentQuestionIndex
                  ? 'bg-blue-600 text-white shadow-md'
                  : selectedAnswers.has(quizQuestions[index]?.id || -1)
                    ? 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Contenido principal de la pregunta */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          {currentQuestion ? (
            <div className="mb-8 p-6 bg-blue-50 rounded-xl shadow-md border border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-baseline">
                {currentQuestionIndex + 1}. {currentQuestion.question_text}
                {currentQuestion.topic && (
                  <span className="ml-3 text-sm font-medium text-blue-700 px-3 py-1 bg-blue-200 rounded-full shadow-sm">
                    {currentQuestion.topic}
                  </span>
                )}
              </h2>
              <div className="space-y-3">
                {currentQuestion.answers.map((qa) => (
                  <label
                    key={qa.answer.id}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-300 ease-in-out
                      ${selectedAnswers.get(currentQuestion.id) === qa.answer.id
                        ? 'border-blue-400 bg-blue-100 shadow-md'
                        : 'border-gray-200 bg-white hover:shadow-sm'}
                    `}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={qa.answer.id}
                      checked={selectedAnswers.get(currentQuestion.id) === qa.answer.id}
                      onChange={() => handleAnswerSelection(currentQuestion.id, qa.answer.id)}
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3 text-base text-gray-700">{qa.answer.answer_text}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">Cargando pregunta...</p>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md
                ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Anterior
            </button>
            {currentQuestionIndex === quizQuestions.length - 1 ? (
              <button
                onClick={submitQuiz}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md"
              >
                Finalizar Cuestionario
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
