// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Maneja las solicitudes GET para obtener los datos del perfil de un usuario.
 * Requiere el 'X-User-Id' en los headers para la autorización.
 */
export async function GET(request: Request) {
  try {
    const userIdHeader = request.headers.get('X-User-Id');
    const userRoleHeader = request.headers.get('X-User-Role'); // Para validación adicional

    // 1. Validar que se ha proporcionado un userId y un rol
    if (!userIdHeader || !userRoleHeader) {
      return NextResponse.json({ message: 'No autorizado: Falta ID o rol de usuario en los headers.' }, { status: 401 });
    }

    const userId = parseInt(userIdHeader, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ message: 'ID de usuario inválido.' }, { status: 400 });
    }

    // 2. Buscar el usuario en la base de datos
    // Incluye los resultados de exámenes si el usuario es un estudiante
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Selecciona explícitamente los campos para evitar enviar la contraseña
        id: true,
        nombre: true,
        role: true,
        createdAt: true,
        examResults: userRoleHeader === 'STUDENT' ? { // Solo incluye resultados si el rol es 'STUDENT'
          select: {
            id: true,
            examTitle: true,
            score: true,
            maxScore: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        } : false, // No incluye examResults si no es estudiante
      },
    });

    // 3. Verificar si el perfil existe y si el rol coincide
    if (!profile || profile.role !== userRoleHeader) {
      // Evitar dar demasiada información si el usuario no existe o el rol no coincide
      return NextResponse.json({ message: 'No autorizado: Usuario no encontrado o rol no coincide.' }, { status: 403 });
    }

    // 4. Retornar los datos del perfil
    return NextResponse.json({ profile }, { status: 200 });

  } catch (error) {
    console.error('Error al obtener datos del perfil:', error);
    return NextResponse.json({ message: 'Error interno del servidor al cargar el perfil.' }, { status: 500 });
  }
}
