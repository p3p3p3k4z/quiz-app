// src/app/api/ai-quiz/route.ts
// Este archivo define una API Route de Next.js para interactuar con la API de Gemini.
// Maneja la generación de preguntas de IA y la evaluación de respuestas.

import { NextRequest, NextResponse } from 'next/server';
import {
  AiQuestionData,
  AiEvaluationRequestPayload,
  AiEvaluationResponsePayload,
  GenerateQuestionsRequest,
  EvaluateAnswerRequest,
  GenerateQuestionsResponse,
  EvaluateAnswerResponse,
  MultipleChoiceAiQuestion,
  FillInBlankAiQuestion,
  CodeEvaluationAiQuestion,
  AiAnswerChoice, // Importar para manejar las opciones de MC
} from '@/interfaces/aiQuestion'; // Asegúrate de que la ruta sea correcta

// Configura la API key de Gemini desde las variables de entorno
// Asegúrate de que GEMINI_API_KEY esté definido en tu archivo .env.local
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// URL del endpoint de Gemini Flash
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Función auxiliar para llamar a la API de Gemini
async function callGeminiApi(payload: any): Promise<any> {
  if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY no está configurada en las variables de entorno.");
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno. Por favor, añádela a tu archivo .env.local");
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error de la API de Gemini:", errorData);
    throw new Error(`Error al llamar a la API de Gemini: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  return result;
}

// Handler para solicitudes POST (generar preguntas o evaluar respuestas)
export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    if (action === "generate") {
      const generatePayload = payload as { topic: string; numQuestions: number };
      return await handleGenerateQuestions(generatePayload.topic, generatePayload.numQuestions);
    } else if (action === "evaluate") {
      const evaluationPayload = payload as AiEvaluationRequestPayload;
      return await handleEvaluateAnswer(evaluationPayload);
    } else {
      return NextResponse.json({ success: false, error: "Acción no válida." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Error en /api/ai-quiz:", error.message);
    return NextResponse.json(
      { success: false, error: `Error interno del servidor: ${error.message}` },
      { status: 500 }
    );
  }
}

// Función para manejar la generación de preguntas
async function handleGenerateQuestions(topic: string, numQuestions: number): Promise<NextResponse<GenerateQuestionsResponse>> {
  try {
    // Definir el esquema de respuesta para la IA
    const questionSchema = {
      type: "OBJECT",
      properties: {
        question_text: { type: "STRING" },
        question_type: { type: "STRING", enum: ["MULTIPLE_CHOICE", "FILL_IN_BLANK", "CODE_EVAL"] },
        correct_answer_reference: { type: "STRING" }, // Para MC, esto será un JSON string de AiAnswerChoice[] con isCorrect: true
        answers: { // Solo para MULTIPLE_CHOICE
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              answerText: { type: "STRING" },
              isCorrect: { type: "BOOLEAN" }
            },
            required: ["answerText", "isCorrect"]
          }
        },
        language: { type: "STRING" }, // Solo para CODE_EVAL
        initial_code: { type: "STRING" } // Solo para CODE_EVAL
      },
      required: ["question_text", "question_type", "correct_answer_reference"]
    };

    const prompt = `Genera ${numQuestions} preguntas variadas (opción múltiple, completar, y evaluación de código) sobre el tema de "${topic}".
    Para cada pregunta, proporciona:
    - "question_text": El texto de la pregunta.
    - "question_type": "MULTIPLE_CHOICE", "FILL_IN_BLANK" o "CODE_EVAL".
    - "correct_answer_reference": Para opción múltiple, debe ser un JSON string de UN array de objetos { "answerText": "...", "isCorrect": true } representando solo las respuestas correctas. Para completar, la respuesta exacta. Para código, criterios de evaluación o salida esperada (ej. "La salida debe ser 'Hola Mundo'").
    - Para "MULTIPLE_CHOICE", incluye un array de objetos "answers" con "answerText" y "isCorrect" para TODAS las opciones.
    - Para "CODE_EVAL", incluye opcionalmente "language" (ej. "Python", "C", "JavaScript") y "initial_code" (el código inicial para el estudiante).

    Asegúrate de que la salida sea un ARRAY de objetos JSON, cada uno siguiendo el formato de este esquema: ${JSON.stringify(questionSchema)}
    Genera preguntas relacionadas con Sistemas Operativos.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: questionSchema // El esquema para cada elemento del array
        }
      }
    };

    const result = await callGeminiApi(payload);

    if (!result.candidates || result.candidates.length === 0 || !result.candidates[0].content || !result.candidates[0].content.parts || result.candidates[0].content.parts.length === 0) {
      console.error("Respuesta inesperada de Gemini:", JSON.stringify(result));
      return NextResponse.json({ success: false, error: "No se pudieron generar preguntas. Respuesta de IA incompleta." }, { status: 500 });
    }

    const aiQuestionsJsonString = result.candidates[0].content.parts[0].text;
    let aiQuestionsParsed: any[];
    try {
      aiQuestionsParsed = JSON.parse(aiQuestionsJsonString);
    } catch (parseError) {
      console.error("Error al parsear JSON de preguntas de IA:", parseError);
      console.error("JSON recibido:", aiQuestionsJsonString);
      return NextResponse.json({ success: false, error: "Error al procesar las preguntas generadas por IA. JSON inválido." }, { status: 500 });
    }

    const formattedQuestions: AiQuestionData[] = aiQuestionsParsed.map((q: any, index: number) => {
      const questionId = `${q.question_type}-${index + 1}-${Date.now()}`; // Generar un ID único simple

      if (q.question_type === "MULTIPLE_CHOICE") {
        const answers: AiAnswerChoice[] = q.answers || [];
        return {
          id: questionId,
          question_text: q.question_text,
          question_type: "MULTIPLE_CHOICE",
          correct_answer_reference: q.correct_answer_reference, // Esto debería ser un JSON string de las respuestas correctas
          answers: answers,
          topic: topic,
        } as MultipleChoiceAiQuestion;
      } else if (q.question_type === "FILL_IN_BLANK") {
        return {
          id: questionId,
          question_text: q.question_text,
          question_type: "FILL_IN_BLANK",
          correct_answer_reference: q.correct_answer_reference,
          topic: topic,
        } as FillInBlankAiQuestion;
      } else if (q.question_type === "CODE_EVAL") {
        return {
          id: questionId,
          question_text: q.question_text,
          question_type: "CODE_EVAL",
          correct_answer_reference: q.correct_answer_reference, // Criterios de evaluación o salida esperada
          language: q.language || null,
          initial_code: q.initial_code || null,
          topic: topic,
        } as CodeEvaluationAiQuestion;
      }
      return null;
    }).filter(Boolean) as AiQuestionData[];

    const finalQuestions = formattedQuestions.slice(0, numQuestions);

    return NextResponse.json({ success: true, questions: finalQuestions }, { status: 200 });

  } catch (error: any) {
    console.error("Error al generar preguntas:", error.message);
    return NextResponse.json(
      { success: false, error: `Error al generar preguntas de IA: ${error.message}` },
      { status: 500 }
    );
  }
}

// Función para manejar la evaluación de respuestas
async function handleEvaluateAnswer(payload: AiEvaluationRequestPayload): Promise<NextResponse<EvaluateAnswerResponse>> {
  try {
    const { question, studentAnswer } = payload;
    let evaluationPrompt = ``;

    if (question.question_type === "MULTIPLE_CHOICE") {
      const mcQuestion = question as MultipleChoiceAiQuestion;
      let correctOptionsParsed: AiAnswerChoice[] = [];
      try {
        correctOptionsParsed = JSON.parse(mcQuestion.correct_answer_reference);
      } catch (e) {
        console.error("Error al parsear correct_answer_reference para MC:", e);
      }
      const correctOptionTexts = correctOptionsParsed.filter(a => a.isCorrect).map(a => a.answerText);
      const studentAnswerArray = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];

      evaluationPrompt = `La pregunta de opción múltiple es: "${mcQuestion.question_text}".
      Las opciones correctas son: ${JSON.stringify(correctOptionTexts)}.
      La respuesta(s) seleccionada(s) por el estudiante es: ${JSON.stringify(studentAnswerArray)}.
      Evalúa si la respuesta del estudiante es *completamente* correcta (todas las opciones correctas seleccionadas y ninguna incorrecta) y proporciona retroalimentación clara y concisa. Responde SÓLO el JSON con "isCorrect" booleano y "evaluation" string.`;

    } else if (question.question_type === "FILL_IN_BLANK") {
      const fbQuestion = question as FillInBlankAiQuestion;
      evaluationPrompt = `La pregunta de completar es: "${fbQuestion.question_text}".
      La respuesta correcta esperada es: "${fbQuestion.correct_answer_reference}".
      La respuesta enviada por el estudiante es: "${studentAnswer}".
      Evalúa si la respuesta del estudiante es correcta basándote en la respuesta esperada y proporciona retroalimentación. Considera variaciones menores (casos de mayúsculas/minúsculas, espacios extra) si son lógicamente correctas. Responde SÓLO el JSON con "isCorrect" booleano y "evaluation" string.`;

    } else if (question.question_type === "CODE_EVAL") {
      const ceQuestion = question as CodeEvaluationAiQuestion;
      // Prompt mejorado para CODE_EVAL: Guía a la IA para una evaluación más estructurada y clara.
      evaluationPrompt = `La pregunta de evaluación de código es: "${ceQuestion.question_text}".
      El código inicial (si provisto) es: "${ceQuestion.initial_code || 'N/A'}".
      Los criterios de evaluación o la salida esperada son: "${ceQuestion.correct_answer_reference}".
      El código enviado por el estudiante es: \n\`\`\`${ceQuestion.language || 'text'}\n${studentAnswer}\n\`\`\`

      Tu tarea es evaluar el código del estudiante basándote en los criterios/salida esperada.
      Determina si la respuesta es correcta (true) o incorrecta (false) y proporciona retroalimentación detallada.
      La retroalimentación debe incluir:
      1. Si la solución del estudiante cumple con los requisitos.
      2. Qué aspectos son correctos o incorrectos.
      3. Sugerencias de mejora si es incorrecto, o una confirmación si es correcto.
      Responde SÓLO el JSON con "isCorrect" (boolean) y "evaluation" (string) que contiene la retroalimentación.`;

    } else {
      return NextResponse.json({ success: false, error: "Tipo de pregunta no soportado para evaluación." }, { status: 400 });
    }

    const geminiPayload = {
      contents: [{ role: "user", parts: [{ text: evaluationPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            evaluation: { type: "STRING" },
            isCorrect: { type: "BOOLEAN" }
          },
          required: ["evaluation", "isCorrect"]
        }
      }
    };

    const result = await callGeminiApi(geminiPayload);

    if (!result.candidates || result.candidates.length === 0 || !result.candidates[0].content || !result.candidates[0].content.parts || result.candidates[0].content.parts.length === 0) {
      console.error("Respuesta de evaluación inesperada de Gemini:", JSON.stringify(result));
      return NextResponse.json({ success: false, error: "No se pudo obtener la evaluación. Respuesta de IA incompleta." }, { status: 500 });
    }

    const evaluationResultJsonString = result.candidates[0].content.parts[0].text;
    let evaluationResult: AiEvaluationResponsePayload;
    try {
      evaluationResult = JSON.parse(evaluationResultJsonString);
    } catch (parseError) {
      console.error("Error al parsear JSON de evaluación de IA:", parseError);
      console.error("JSON recibido:", evaluationResultJsonString);
      return NextResponse.json({ success: false, error: "Error al procesar la evaluación de IA." }, { status: 500 });
    }

    return NextResponse.json({ success: true, evaluationResult }, { status: 200 });

  } catch (error: any) {
    console.error("Error al evaluar respuesta:", error.message);
    return NextResponse.json(
      { success: false, error: `Error al evaluar respuesta con IA: ${error.message}` },
      { status: 500 }
    );
  }
}
