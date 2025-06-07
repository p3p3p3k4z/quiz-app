// src/components/StudentCrudModal.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface UserData {
  id: number;
  nombre: string;
  password?: string;
  role: string;
}

interface StudentCrudModalProps {
  student: UserData | null; // Null para añadir, objeto UserData para editar
  onClose: () => void;
  professorUserId: number; // ID del profesor que realiza la operación
  professorUserRole: string; // Rol del profesor que realiza la operación
}

export default function StudentCrudModal({ student, onClose, professorUserId, professorUserRole }: StudentCrudModalProps) {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // Por defecto 'STUDENT'
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setNombre(student.nombre);
      setRole(student.role);
      setPassword(''); // No precargamos la contraseña por seguridad
    } else {
      // Resetear para un nuevo estudiante
      setNombre('');
      setPassword('');
      setRole('STUDENT');
    }
    setError(null);
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validación básica
    if (!nombre || !role) {
      setError('Nombre y rol son requeridos.');
      setLoading(false);
      return;
    }
    if (!student && !password) { // Si es un nuevo estudiante, la contraseña es obligatoria
        setError('La contraseña es requerida para nuevos estudiantes.');
        setLoading(false);
        return;
    }

    const payload = {
      nombre,
      password, // Incluir contraseña solo si se proporciona (nueva o editada)
      role,
      professorId: professorUserId, // Se envía el ID del profesor para autenticación en la API
      professorRole: professorUserRole, // Se envía el rol del profesor para autenticación en la API
    };

    try {
      const url = student ? `/api/admin/students/${student.id}` : '/api/admin/students';
      const method = student ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Los headers de autorización son redundantes si ya van en el body para este ejercicio,
          // pero es una práctica común en sistemas más complejos.
          // 'X-User-Id': professorUserId.toString(),
          // 'X-User-Role': professorUserRole,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || (student ? 'Estudiante actualizado con éxito.' : 'Estudiante añadido con éxito.'));
        onClose(); // Cerrar modal y recargar lista de estudiantes
      } else {
        setError(data.message || 'Error en la operación.');
        console.error('API Error:', data.message);
      }
    } catch (err: any) {
      setError('Error de conexión. Inténtalo de nuevo.');
      console.error('Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {student ? 'Editar Alumno' : 'Añadir Nuevo Alumno'}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre de Usuario
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña {student ? '(dejar en blanco para no cambiar)' : '*'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="STUDENT">Estudiante</option>
              <option value="PROFESSOR">Profesor</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'}
              `}
              disabled={loading}
            >
              {loading ? 'Guardando...' : (student ? 'Guardar Cambios' : 'Añadir Alumno')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
