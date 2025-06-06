// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importa la instancia de Prisma

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json(); // Obtiene el nombre de usuario, contraseña y rol

    // Valida que todos los campos requeridos estén presentes
    if (!username || !password || !role) {
      return NextResponse.json({ message: 'Nombre de usuario, contraseña y rol son requeridos.' }, { status: 400 });
    }

    // Valida que el rol proporcionado sea uno de los valores permitidos (STUDENT o PROFESSOR)
    if (!['STUDENT', 'PROFESSOR'].includes(role.toUpperCase())) {
      return NextResponse.json({ message: 'Rol inválido. Los roles permitidos son STUDENT o PROFESSOR.' }, { status: 400 });
    }

    // Verifica si ya existe un usuario con el mismo nombre de usuario
    const existingUser = await prisma.user.findUnique({
      where: { nombre: username },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'El nombre de usuario ya existe.' }, { status: 409 });
    }

    // Crea un nuevo usuario en la base de datos
    // NOTA: En una aplicación de producción, la contraseña DEBE ser hasheada (e.g., con bcrypt)
    // antes de ser almacenada por razones de seguridad. Aquí se almacena en texto plano para simplificar.
    const newUser = await prisma.user.create({
      data: {
        nombre: username,
        password: password, // Contraseña en texto plano (¡solo para desarrollo!)
        role: role.toUpperCase(), // Almacena el rol como STRING en mayúsculas
      },
    });

    return NextResponse.json({ message: 'Usuario registrado exitosamente', user: newUser }, { status: 201 });

  } catch (error) {
    console.error('Error durante el registro:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
