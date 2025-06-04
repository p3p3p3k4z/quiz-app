// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { nombre, password } = await request.json();

    if (!nombre || !password) {
      return NextResponse.json({ message: 'Nombre de usuario y contraseña son requeridos.' }, { status: 400 });
    }

    // Buscar al usuario por nombre
    const user = await prisma.user.findUnique({
      where: { nombre: nombre },
    });

    if (!user) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    // Comparar la contraseña directamente
    // ADVERTENCIA: MUY INSEGURO para producción. Solo para este ejemplo simple.
    if (password !== user.password) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    // Si las credenciales son válidas, devolver el nombre de usuario
    return NextResponse.json({ message: 'Inicio de sesión exitoso.', userName: user.nombre }, { status: 200 });

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
