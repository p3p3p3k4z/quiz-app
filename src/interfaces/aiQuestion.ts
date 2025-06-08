// src/interfaces/aiQuestion.ts
// Este archivo define las estructuras de datos (interfaces y tipos)
// utilizadas específicamente para las preguntas generadas por IA y su evaluación.
// Esto permite extender la funcionalidad sin modificar el archivo `quiz.ts` existente del usuario.

// --- Tipos de Pregunta AI ---

export type AiQuestionType = "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "CODE_EVAL";

// Interface para una única opción de respuesta para preguntas de IA de opción múltiple
export interface AiAnswerChoice {
  answerText: string; // El contenido de texto de la opción de respuesta
  isCorrect: boolean; // Indica si esta es la respuesta correcta
}

// Base interface que todas las preguntas generadas por IA extenderán
export interface BaseAiQuestion {
  id: string; // Un ID único generado en el frontend para rastrear la pregunta en la UI (no es de DB)
  question_text: string; // El texto principal de la pregunta
  topic?: string; // Opcional: Tema de la pregunta (e.g., "Sistemas Operativos")
  question_type: AiQuestionType; // El tipo de pregunta (MC, Fill-in, Code Eval)
  // `correct_answer_reference` contendrá la referencia para la respuesta correcta o criterios de evaluación.
  // Para MC, podría ser un JSON string de las opciones correctas.
  // Para Completar, el texto exacto. Para Code Eval, los criterios.
  correct_answer_reference: string;
}

// Interface para Preguntas de Opción Múltiple generadas por IA
export interface MultipleChoiceAiQuestion extends BaseAiQuestion {
  question_type: "MULTIPLE_CHOICE";
  answers: AiAnswerChoice[]; // Array de opciones de respuesta posibles para esta pregunta de IA
}

// Interface para Preguntas de Completar generadas por IA
export interface FillInBlankAiQuestion extends BaseAiQuestion {
  question_type: "FILL_IN_BLANK";
  // `correct_answer_reference` contendrá el texto exacto a rellenar
}

// Interface para Preguntas de Evaluación de Código generadas por IA
export interface CodeEvaluationAiQuestion extends BaseAiQuestion {
  question_type: "CODE_EVAL";
  language?: string; // Opcional: Lenguaje de programación (e.g., "C", "Python")
  initial_code?: string; // Opcional: Fragmento de código inicial proporcionado al estudiante
  // `correct_answer_reference` contendrá los criterios o la salida esperada
}

// Tipo de unión para cualquier pregunta generada por IA que se mostrará
export type AiQuestionData = MultipleChoiceAiQuestion | FillInBlankAiQuestion | CodeEvaluationAiQuestion;

// --- Interfaces de Evaluación de IA ---

// Payload para la solicitud de evaluación a la API de Gemini
export interface AiEvaluationRequestPayload {
  question: AiQuestionData; // La pregunta original que se está evaluando
  studentAnswer: string | string[]; // La respuesta del estudiante (string para texto, array de strings para MC)
}

// Estructura de la respuesta de la API de Gemini para evaluación
export interface AiEvaluationResponsePayload {
  evaluation: string; // Retroalimentación detallada de la IA
  isCorrect: boolean; // Indicador de si la respuesta fue correcta (true/false)
}

// --- Interfaces de Solicitud/Respuesta de la API de Next.js (`/api/ai-quiz`) ---

// Solicitud al endpoint /api/ai-quiz para generar preguntas
export interface GenerateQuestionsRequest {
  action: "generate";
  topic: string; // El tema para las preguntas (ej. "Sistemas Operativos")
  numQuestions: number; // Cantidad de preguntas a generar
}

// Solicitud al endpoint /api/ai-quiz para evaluar una respuesta
export interface EvaluateAnswerRequest {
  action: "evaluate";
  payload: AiEvaluationRequestPayload; // Contiene la pregunta y la respuesta del estudiante
}

// Respuesta del endpoint /api/ai-quiz para preguntas generadas
export interface GenerateQuestionsResponse {
  success: boolean; // Indica si la operación fue exitosa
  questions?: AiQuestionData[]; // Array de preguntas generadas si fue exitoso
  error?: string; // Mensaje de error si la operación falló
}

// Respuesta del endpoint /api/ai-quiz para evaluación de respuesta
export interface EvaluateAnswerResponse {
  success: boolean; // Indica si la operación fue exitosa
  evaluationResult?: AiEvaluationResponsePayload; // Resultado de la evaluación si fue exitoso
  error?: string; // Mensaje de error si la operación falló
}
