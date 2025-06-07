// src/app/api/admin/students/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función de utilidad para validar la autorización del profesor
async function authorizeProfessor(request: Request) {
  // En una aplicación de producción, esto debería usar un sistema de sesión o JWT.
  // Para este ejemplo, leeremos el ID y rol de los headers (o del body para POST/PUT/DELETE)
  // Nota: Pasar credenciales sensibles por headers/body directamente no es la práctica más segura.
  // Es una simplificación para fines de demostración.

  const professorId = request.headers.get('X-User-Id') || (await request.json().then(body => body.professorId).catch(() => null));
  const professorRole = request.headers.get('X-User-Role') || (await request.json().then(body => body.professorRole).catch(() => null));

  if (!professorId || professorRole !== 'PROFESSOR') {
    return false; // No autorizado
  }
  // Opcional: Verificar que el profesor ID realmente existe en la DB
  const professor = await prisma.user.findUnique({
    where: { id: parseInt(professorId as string) },
  });
  return professor && professor.role === 'PROFESSOR';
}


/**
 * Maneja las solicitudes GET para obtener todos los estudiantes con sus calificaciones.
 */
export async function GET(request: Request) {
  try {
    // Basic authorization check (profesor solo puede ver)
    const professorId = request.headers.get('X-User-Id');
    const professorRole = request.headers.get('X-User-Role');

    if (!professorId || professorRole !== 'PROFESSOR') {
      return NextResponse.json({ message: 'No autorizado para ver esta información.' }, { status: 403 });
    }

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      include: {
        examResults: { // Incluye los resultados de los exámenes de cada estudiante
          orderBy: { createdAt: 'desc' }, // Ordena por fecha de creación descendente
        },
      },
      orderBy: {
        nombre: 'asc', // Ordena los estudiantes por nombre
      },
    });

    return NextResponse.json({ students }, { status: 200 });

  } catch (error) {
    console.error('Error al obtener estudiantes y resultados:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}

/**
 * Maneja las solicitudes POST para crear un nuevo usuario (solo PROFESSOR).
 */
export async function POST(request: Request) {
  try {
    // Parsear el body para obtener los datos del nuevo usuario y los datos de autorización del profesor
    const body = await request.json();
    const { nombre, password, role, professorId, professorRole } = body;

    // Autorización: Solo un profesor puede crear usuarios
    if (!professorId || professorRole !== 'PROFESSOR') {
      return NextResponse.json({ message: 'No autorizado para crear usuarios.' }, { status: 403 });
    }

    // Validación de campos
    if (!nombre || !password || !role) {
      return NextResponse.json({ message: 'Nombre, contraseña y rol son requeridos.' }, { status: 400 });
    }
    if (!['STUDENT', 'PROFESSOR'].includes(role.toUpperCase())) {
      return NextResponse.json({ message: 'Rol inválido. Los roles permitidos son STUDENT o PROFESSOR.' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { nombre: nombre },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'El nombre de usuario ya existe.' }, { status: 409 });
    }

    // Crear nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        nombre: nombre,
        password: password, // En producción: ¡HASHEAR CONTRASEÑA!
        role: role.toUpperCase(),
      },
    });

    return NextResponse.json({ message: 'Usuario creado exitosamente.', user: newUser }, { status: 201 });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ message: 'Error interno del servidor al crear usuario.' }, { status: 500 });
  }
}
