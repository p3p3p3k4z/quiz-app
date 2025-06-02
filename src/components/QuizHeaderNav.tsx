// src/components/QuizHeaderNav.tsx
import React from 'react';

interface QuizHeaderNavProps {
  categories: string[]; // Nombres de las categorías/temas
  currentCategoryIndex: number; // Índice de la categoría actual
  onTopicClick: (index: number) => void; // Nueva prop para manejar el clic en el tema
}

export default function QuizHeaderNav({ categories, currentCategoryIndex, onTopicClick }: QuizHeaderNavProps) {
  return (
    <div className="w-full bg-white shadow-lg rounded-xl p-4 mb-8">
      <div className="flex flex-wrap justify-center sm:justify-between items-center gap-2 md:gap-4">
        {categories.map((category, index) => (
          <button
            key={category}
            onClick={() => onTopicClick(index)} // Llama a la función pasada por prop
            className={`flex flex-col items-center text-center px-2 py-1 rounded-lg transition-all duration-300 ease-in-out
              ${index <= currentCategoryIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'}
              ${index === currentCategoryIndex ? 'cursor-default' : 'hover:bg-gray-100'}
            `}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1
              ${index === currentCategoryIndex ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'}
              ${index < currentCategoryIndex ? 'bg-blue-100 text-blue-600' : ''}
            `}>
              {index + 1}
            </div>
            <span className="text-xs md:text-sm whitespace-nowrap">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
