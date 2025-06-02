// src/components/QuestionDisplay.tsx
import React from 'react';
import { QuestionData } from '@/interfaces/quiz';

interface QuestionDisplayProps {
  question: QuestionData;
  questionNumber: number;
  selectedAnswerId: number | undefined;
  onSelectAnswer: (questionId: number, answerId: number) => void;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  selectedAnswerId,
  onSelectAnswer,
}: QuestionDisplayProps) {
  return (
    // Contenedor principal de la pregunta, con estilos mínimos para visibilidad
    <div className="p-4 mb-4 bg-gray-100 border border-gray-300 rounded-lg">
      <h2 className="text-lg font-bold mb-3 text-gray-800">
        {questionNumber}. {question.question_text}
      </h2>
      <div className="flex flex-col space-y-2"> {/* Opciones de respuesta en una columna */}
        {question.answers.map((qa) => (
          <button
            key={qa.answer.id}
            onClick={() => onSelectAnswer(question.id, qa.answer.id)}
            className={`
              flex items-center justify-start text-left
              p-3 border rounded-md transition-colors duration-200
              ${selectedAnswerId === qa.answer.id
                ? 'bg-blue-500 text-white border-blue-600' // Estilo cuando está seleccionado
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} // Estilo normal
            `}
          >
            {/* Indicador de selección (círculo simple) */}
            <div className={`w-4 h-4 rounded-full border mr-2 flex-shrink-0
              ${selectedAnswerId === qa.answer.id ? 'bg-white border-white' : 'border-gray-400 bg-transparent'}
            `}>
              {selectedAnswerId === qa.answer.id && (
                <div className="w-2 h-2 rounded-full bg-blue-500 m-auto"></div>
              )}
            </div>
            <span className="flex-grow">{qa.answer.answer_text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
