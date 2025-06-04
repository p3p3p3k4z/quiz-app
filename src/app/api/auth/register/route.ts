// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { nombre, password } = await request.json();

    if (!nombre || !password) {
      return NextResponse.json({ message: 'Nombre de usuario y contraseña son requeridos.' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { nombre: nombre },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'El nombre de usuario ya está en uso.' }, { status: 409 });
    }

    // Crear el nuevo usuario en la base de datos con la contraseña en texto plano
    // ADVERTENCIA: MUY INSEGURO para producción. Solo para este ejemplo simple.
    const newUser = await prisma.user.create({
      data: {
        nombre: nombre,
        password: password, // Contraseña guardada directamente
      },
    });

    return NextResponse.json({ message: 'Usuario registrado exitosamente.', userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error('Error en el registro de usuario:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
