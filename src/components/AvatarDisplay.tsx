// src/components/AvatarDisplay.tsx
'use client'; // Directiva para indicar que es un Client Component

import React from 'react';

// Asegúrate de que esta sea la única exportación por defecto en este archivo.
export default function AvatarDisplay() {
  return (
    <div className="mt-8">
      <p className="text-lg font-semibold mb-4">Más de 5,000 ejecutivos han tomado el cuestionario:</p>
      <div className="flex -space-x-2 overflow-hidden justify-center lg:justify-start">
        {[...Array(5)].map((_, i) => (
          <img
            key={i}
            className="inline-block h-12 w-12 rounded-full ring-2 ring-white object-cover"
            src={`https://placehold.co/48x48/cccccc/000000?text=User${i+1}`}
            alt={`User ${i+1}`}
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/48x48/cccccc/000000?text=User'; // Fallback
            }}
          />
        ))}
        <span className="flex items-center justify-center h-12 w-12 rounded-full ring-2 ring-white bg-gray-700 text-white text-sm font-medium">
          +5k
        </span>
      </div>
    </div>
  );
}
