// src/components/AvatarDisplay.tsx
'use client'; // Directiva para indicar que es un Client Component

import React from 'react';

interface AvatarDisplayProps {
  userName?: string;
}

export default function AvatarDisplay({ userName }: AvatarDisplayProps) {
  // Función para obtener las iniciales del nombre
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) {
      return name.charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="relative w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-inner">
      {userName ? getInitials(userName) : <i className="fas fa-user"></i> /* Icono de Font Awesome si no hay nombre */}
    </div>
  );
}
