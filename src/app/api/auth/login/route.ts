// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importa la instancia de Prisma

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json(); // Obtiene el nombre de usuario y contraseña

    // Valida que todos los campos requeridos estén presentes
    if (!username || !password) {
      return NextResponse.json({ message: 'Nombre de usuario y contraseña son requeridos.' }, { status: 400 });
    }

    // Busca al usuario en la base de datos por su nombre de usuario
    const user = await prisma.user.findUnique({
      where: { nombre: username },
    });

    // Si el usuario no existe o la contraseña no coincide, devuelve un error 401 (No autorizado)
    // NOTA: En una aplicación de producción, la comparación de contraseñas DEBE usar un método seguro
    // como bcrypt. Aquí se compara en texto plano para simplificar.
    if (!user || user.password !== password) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    // Si las credenciales son válidas, devuelve una respuesta de éxito con los datos del usuario
    // Estos datos se utilizarán para gestionar la sesión en el cliente y para las redirecciones.
    return NextResponse.json({
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user.id,
        nombre: user.nombre,
        role: user.role, // Asegúrate de que el rol se incluya
      },
    }, { status: 200 });

  } catch (error) {
    // Captura y registra cualquier error que ocurra durante el proceso de login
    console.error('Error durante el login:', error);
    // Devuelve un error interno del servidor si algo sale mal
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
