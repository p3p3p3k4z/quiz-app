// src/app/cuestionario-ia/page.tsx
// Esta página contiene la lógica y la UI para el "Cuestionario IA"
// que genera preguntas y evalúa respuestas usando la API de Gemini.

"use client"; // Marca este componente como un Client Component en Next.js

import React, { useState, useEffect, FormEvent } from 'react';
import {
  AiQuestionData,
  MultipleChoiceAiQuestion,
  FillInBlankAiQuestion,
  CodeEvaluationAiQuestion,
  AiAnswerChoice, // Importar para manejar las opciones de MC
  GenerateQuestionsResponse,
  EvaluateAnswerResponse,
  AiEvaluationRequestPayload,
} from '@/interfaces/aiQuestion'; // Importar de la nueva interfaz específica para IA
import { initializeFirebaseClient, isFirebaseAuthInitialized, getAuthInstance } from '@/lib/firebase'; // Importa el cliente de Firebase
import { useRouter } from 'next/navigation'

// Define la URL del endpoint de tu API de Next.js
const API_ENDPOINT = '/api/ai-quiz';

export default function CuestionarioIA() {
  const [questions, setQuestions] = useState<AiQuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // studentAnswers ahora puede ser un string (para texto/código) o un array de strings (para múltiples selecciones de MC)
  const [studentAnswers, setStudentAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [feedback, setFeedback] = useState<{ [key: string]: { evaluation: string; isCorrect: boolean } }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false); // Estado para Firebase

  // Estado para controlar la visibilidad del modal de advertencia
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const router = useRouter();
  
  // Inicializar Firebase y esperar a que la autenticación esté lista
  useEffect(() => {
    async function init() {
      await initializeFirebaseClient();
      setIsFirebaseReady(true);
      // Opcional: Obtener el usuario actual si necesitas su UID para algo aquí
      // const auth = getAuthInstance();
      // if (auth && auth.currentUser) {
      //   console.log("Usuario actual:", auth.currentUser.uid);
      // }
    }
    init();
  }, []);

  // Cargar preguntas una vez que Firebase esté listo
  useEffect(() => {
    if (isFirebaseReady && questions.length === 0 && !error && loading) {
      fetchQuestions();
    }
  }, [isFirebaseReady, questions.length, error, loading]); // Dependencias mejoradas

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "generate",
          payload: {
            topic: "Sistemas Operativos",
            numQuestions: 3 // Pedimos 3 preguntas
          }
        }),
      });

      const data: GenerateQuestionsResponse = await response.json();

      if (data.success && data.questions) {
        // Asegurarse de que cada pregunta tiene un ID único en el cliente
        const questionsWithClientIds = data.questions.map((q, idx) => ({
          ...q,
          id: q.id || `ai-question-${idx}-${Date.now()}`, // Usar el ID de la IA si existe, sino generar uno simple
        }));
        setQuestions(questionsWithClientIds);
        console.log("Preguntas generadas:", questionsWithClientIds);
      } else {
        setError(data.error || "No se pudieron cargar las preguntas de la IA.");
      }
    } catch (err: any) {
      console.error("Error fetching questions:", err);
      setError(`Error al conectar con el servidor para obtener preguntas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[], type: string) => {
    setStudentAnswers((prev) => {
      if (type === "MULTIPLE_CHOICE") {
        // Para MC, `value` es un array con el `answerText` del checkbox que cambió
        const currentSelections = Array.isArray(prev[questionId]) ? prev[questionId] as string[] : [];
        const itemValue = Array.isArray(value) ? value[0] : value; // Solo tomamos el primer elemento del array

        if (currentSelections.includes(itemValue)) {
          // Deseleccionar
          return { ...prev, [questionId]: currentSelections.filter(item => item !== itemValue) };
        } else {
          // Seleccionar
          return { ...prev, [questionId]: [...currentSelections, itemValue] };
        }
      }
      // Para FILL_IN_BLANK o CODE_EVAL, el valor es un string
      return { ...prev, [questionId]: value };
    });
    setShowFeedback(false); // Ocultar feedback si el usuario cambia la respuesta
  };


  const evaluateAnswer = async (question: AiQuestionData, answer: string | string[]) => {
    setLoading(true);
    setError(null);
    setShowFeedback(false);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "evaluate",
          payload: {
            question: question,
            studentAnswer: answer,
          } as AiEvaluationRequestPayload,
        }),
      });

      const data: EvaluateAnswerResponse = await response.json();

      if (data.success && data.evaluationResult) {
        setFeedback((prev) => ({
          ...prev,
          [question.id]: data.evaluationResult!,
        }));
        setShowFeedback(true);
        console.log(`Feedback para ${question.id}:`, data.evaluationResult);
      } else {
        setError(data.error || "No se pudo obtener la retroalimentación de la IA.");
      }
    } catch (err: any) {
      console.error("Error evaluating answer:", err);
      setError(`Error al conectar con el servidor para evaluar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: FormEvent) => {
    e.preventDefault();
    if (!questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const answer = studentAnswers[currentQuestion.id];

    // Verificar si la respuesta está vacía o es un array vacío
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      setWarningMessage("Por favor, introduce una respuesta antes de continuar.");
      setShowWarningModal(true);
      return;
    }

    await evaluateAnswer(currentQuestion, answer);
  };

  const handleNextQuestion = () => {
    // Permite avanzar si ya se mostró feedback, sin importar si es correcto o incorrecto.
    if (!showFeedback && feedback[questions[currentQuestionIndex]?.id] === undefined) {
      setWarningMessage("Por favor, evalúa tu respuesta antes de pasar a la siguiente pregunta.");
      setShowWarningModal(true);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Limpiar la respuesta y el feedback de la siguiente pregunta al avanzar
      setStudentAnswers((prev) => ({ ...prev, [questions[currentQuestionIndex+1].id]: '' }));
      setShowFeedback(false); // Reset feedback for next question
    } else {
      setIsQuizFinished(true);
    }
  };

  const renderQuestion = (question: AiQuestionData) => {
    const currentAnswer = studentAnswers[question.id];

    switch (question.question_type) {
      case "MULTIPLE_CHOICE":
        const mcQuestion = question as MultipleChoiceAiQuestion;
        const selectedAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
        return (
          <div className="space-y-4">
            {mcQuestion.answers.map((choice, index) => (
              <div key={index} className="flex items-center p-3 border border-gray-300 rounded-lg shadow-sm bg-blue-950">
                <input
                  type="checkbox"
                  id={`choice-${question.id}-${index}`}
                  value={choice.answerText}
                  checked={selectedAnswers.includes(choice.answerText)}
                  onChange={(e) => handleAnswerChange(question.id, [e.target.value], "MULTIPLE_CHOICE")}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                />
                <label htmlFor={`choice-${question.id}-${index}`} className="ml-3 text-lg text-gray-800 flex-grow cursor-pointer">
                  {choice.answerText}
                </label>
              </div>
            ))}
          </div>
        );
      case "FILL_IN_BLANK":
        const fbQuestion = question as FillInBlankAiQuestion;
        return (
          <input
            type="text"
            value={currentAnswer as string || ''} // Asegurarse de que el valor sea un string
            onChange={(e) => handleAnswerChange(fbQuestion.id, e.target.value, "FILL_IN_BLANK")}
            placeholder="Escribe tu respuesta aquí..."
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
          />
        );
      case "CODE_EVAL":
        const ceQuestion = question as CodeEvaluationAiQuestion;
        return (
          <div className="space-y-4">
            {ceQuestion.initial_code && (
              <pre className="bg-gray-100 p-4 rounded-lg text-gray-800 overflow-x-auto text-base font-mono border border-gray-200">
                <code>{ceQuestion.initial_code}</code>
              </pre>
            )}
            <textarea
              value={currentAnswer as string || ''} // Asegurarse de que el valor sea un string
              onChange={(e) => handleAnswerChange(ceQuestion.id, e.target.value, "CODE_EVAL")}
              placeholder={`Escribe tu código en ${ceQuestion.language || 'el lenguaje especificado'} aquí...`}
              rows={8}
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-lg font-mono"
            />
          </div>
        );
      default:
        return <p>Tipo de pregunta no soportado.</p>;
    }
  };

  // Modal de advertencia
  const WarningModal = () => {
    if (!showWarningModal) return null;
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-black p-8 rounded-lg shadow-2xl text-center border-t-4 border-yellow-500">
          <h3 className="text-2xl font-bold text-yellow-700 mb-4">Advertencia</h3>
          <p className="text-lg text-gray-700 mb-6">{warningMessage}</p>
          <button
            onClick={() => setShowWarningModal(false)}
            className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg shadow hover:bg-yellow-600 transition duration-200"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  };


  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter">
        <div className="text-center text-blue-700 text-2xl font-semibold">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando Cuestionario IA...
          {error && <p className="text-red-600 text-lg mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-orange-100 font-inter">
        <div className="text-center p-8 bg-black rounded-xl shadow-lg border border-red-300">
          <h2 className="text-3xl font-bold text-red-700 mb-4">¡Error!</h2>
          <p className="text-xl text-gray-700">{error}</p>
          <button
            onClick={fetchQuestions}
            className="mt-6 px-6 py-3 bg-red-600 text-black text-lg font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isQuizFinished) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 to-blue-100 font-inter">
        <div className="text-center p-8 bg-black rounded-xl shadow-lg border border-green-300">
          <h2 className="text-4xl font-bold text-green-700 mb-4">¡Cuestionario de Sistemas Operativos Finalizado!</h2>
          <p className="text-xl text-gray-700 mb-6">Gracias por completar el cuestionario de Sistemas Operativos. ¡Esperamos que hayas aprendido mucho!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center"> {/* Usa un div para los botones */}
            <button
              onClick={() => {
                // Resetear el estado para que se pueda volver a jugar
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setStudentAnswers({});
                setFeedback({});
                setShowFeedback(false);
                setIsQuizFinished(false);
                setLoading(true);
                fetchQuestions(); // Opcional: para permitir jugar de nuevo
              }}
              className="px-8 py-4 bg-blue-600 text-black text-xl font-bold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            >
              Volver a empezar
            </button>
            <button
              onClick={() => router.push('/')} // Redirige a la página de inicio
              className="px-8 py-4 bg-purple-600 text-black text-xl font-bold rounded-full shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            >
              Ir a Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex justify-center items-center h-screen font-inter">
        <p className="text-xl text-gray-600">No hay preguntas disponibles.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex flex-col items-center justify-center font-inter">
      <WarningModal />
      <div className="bg-black p-8 rounded-2xl shadow-xl w-full max-w-3xl border-2 border-blue-200">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">Cuestionario IA de Sistemas Operativos</h1>
        <div className="text-center text-lg text-gray-600 mb-8">
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
          <p className="text-2xl font-semibold text-gray-800 leading-relaxed">{currentQuestion.question_text}</p>
        </div>

        <form onSubmit={handleSubmitAnswer} className="space-y-6">
          {renderQuestion(currentQuestion)}

          <div className="flex justify-center space-x-4 mt-8">
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-black text-xl font-bold rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-800"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-6 w-6 text-black inline-block mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor"></path>
                </svg>
              ) : ""}
              {loading ? "Evaluando..." : "Evaluar Respuesta"}
            </button>
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 text-black text-xl font-bold rounded-full shadow-lg hover:from-green-600 hover:to-green-800 transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-800"
              // Habilitar el botón "Siguiente" o "Finalizar" si ya se mostró feedback
              disabled={loading || feedback[currentQuestion.id] === undefined}
            >
              {currentQuestionIndex === questions.length - 1 ? "Finalizar Cuestionario" : "Siguiente Pregunta"}
            </button>
          </div>
        </form>

        {showFeedback && feedback[currentQuestion.id] && (
          <div className={`mt-8 p-6 rounded-xl shadow-md transition-all duration-500 ease-in-out transform ${feedback[currentQuestion.id].isCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <h3 className={`text-2xl font-bold mb-4 ${feedback[currentQuestion.id].isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              Retroalimentación: {feedback[currentQuestion.id].isCorrect ? '¡Correcto!' : 'Incorrecto'}
            </h3>
            <p className="text-lg text-gray-800 leading-relaxed">
              {feedback[currentQuestion.id].evaluation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
