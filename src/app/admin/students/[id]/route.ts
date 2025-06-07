// src/app/api/admin/students/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper para validar la autorización del profesor desde los HEADERS (para DELETE)
// o del BODY (para PUT, donde el body es necesario para los datos de actualización)
async function authorizeProfessorRequest(request: Request) {
  // Intentar leer de los headers primero (útil para DELETE sin body o si ya se leyó el body)
  const professorIdHeader = request.headers.get('X-User-Id');
  const professorRoleHeader = request.headers.get('X-User-Role');

  let professorId: number | null = null;
  let professorRole: string | null = null;
  let parsedBody: any = null; // Para retornar el body ya parseado si es necesario para PUT

  if (professorIdHeader && professorRoleHeader) {
    professorId = parseInt(professorIdHeader, 10);
    professorRole = professorRoleHeader;
  } else {
    // Si no está en los headers, intentar leer del body (para PUT)
    try {
      parsedBody = await request.json();
      professorId = parsedBody.professorId;
      professorRole = parsedBody.professorRole;
    } catch (e) {
      // Si el body está vacío o mal formado, estas variables seguirán siendo null
      console.warn("No se pudo parsear el body o no se encontraron credenciales en headers/body.");
    }
  }


  if (!professorId || isNaN(professorId) || professorRole !== 'PROFESSOR') {
    return { authorized: false, message: 'No autorizado: solo los profesores pueden realizar esta acción.', parsedBody: null };
  }

  // Verificar que el profesor ID realmente existe en la DB
  const professor = await prisma.user.findUnique({
    where: { id: professorId },
  });

  if (!professor || professor.role !== 'PROFESSOR') {
    return { authorized: false, message: 'No autorizado: El profesor especificado no es válido.', parsedBody: null };
  }

  return { authorized: true, parsedBody: parsedBody }; // Retorna el body si fue parseado
}


/**
 * Maneja las solicitudes PUT para actualizar un usuario (solo PROFESSOR).
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const studentId = parseInt(params.id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json({ message: 'ID de estudiante inválido.' }, { status: 400 });
    }

    // Leemos el body y obtenemos la autorización
    const { authorized, message: authMessage, parsedBody: body } = await authorizeProfessorRequest(request);
    if (!authorized) {
      return NextResponse.json({ message: authMessage }, { status: 403 });
    }

    // Asegurarnos de que el body para PUT no sea nulo si la autorización vino por headers
    if (!body) {
      return NextResponse.json({ message: 'Faltan datos de actualización en el cuerpo de la solicitud.' }, { status: 400 });
    }

    const { nombre, password, role } = body; // professorId y professorRole ya se usaron para auth

    // Construir los datos para la actualización
    const updateData: { nombre?: string; password?: string; role?: string } = {};
    if (nombre) updateData.nombre = nombre;
    if (password) updateData.password = password; // En producción: ¡HASHEAR CONTRASEÑA!
    if (role) {
      if (!['STUDENT', 'PROFESSOR'].includes(role.toUpperCase())) {
        return NextResponse.json({ message: 'Rol inválido.' }, { status: 400 });
      }
      updateData.role = role.toUpperCase();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No se proporcionaron datos para actualizar.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: studentId },
      data: updateData,
    });

    return NextResponse.json({ message: 'Usuario actualizado exitosamente.', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json({ message: 'Error interno del servidor al actualizar usuario.' }, { status: 500 });
  }
}

/**
 * Maneja las solicitudes DELETE para eliminar un usuario (solo PROFESSOR).
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const studentId = parseInt(params.id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json({ message: 'ID de estudiante inválido.' }, { status: 400 });
    }

    // Para DELETE, la autorización se espera principalmente en los HEADERS
    const { authorized, message: authMessage } = await authorizeProfessorRequest(request);
    if (!authorized) {
      return NextResponse.json({ message: authMessage }, { status: 403 });
    }

    // Antes de eliminar al usuario, elimina sus resultados de exámenes para evitar errores de clave foránea
    await prisma.examResult.deleteMany({
      where: { studentId: studentId },
    });

    const deletedUser = await prisma.user.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ message: 'Usuario eliminado exitosamente.', user: deletedUser }, { status: 200 });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    if (error instanceof Error && (error as any).code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al eliminar usuario.' }, { status: 500 });
  }
}
