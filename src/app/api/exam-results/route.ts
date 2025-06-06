// src/app/api/exam-results/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Define la interfaz para los datos que se esperan en el cuerpo de la solicitud POST
interface ExamResultData {
  studentId: number;  // Coincide con studentId en schema.prisma
  examTitle: string;  // Coincide con examTitle en schema.prisma
  score: number;
  maxScore: number;   // Coincide con maxScore en schema.prisma
  // createdAt no es necesario aquí porque `@default(now())` lo maneja la DB
}

/**
 * Maneja las solicitudes POST para guardar los resultados del examen.
 * Espera un JSON en el cuerpo de la solicitud con studentId, examTitle, score y maxScore.
 */
export async function POST(request: Request) {
  try {
    // 1. Parsea el cuerpo de la solicitud JSON
    const { studentId, examTitle, score, maxScore }: ExamResultData = await request.json();

    // 2. Valida los datos recibidos
    if (studentId === undefined || typeof studentId !== 'number' ||
        !examTitle || typeof examTitle !== 'string' ||
        score === undefined || typeof score !== 'number' ||
        maxScore === undefined || typeof maxScore !== 'number') {
      return NextResponse.json(
        { message: 'Datos de resultado de examen inválidos o incompletos.' },
        { status: 400 } // Bad Request
      );
    }

    // 3. Guarda el resultado en la base de datos usando Prisma
    // NOTA: Los nombres de los campos aquí deben ser los definidos en el modelo de Prisma (camelCase),
    // no los nombres de la columna en la DB (snake_case), ya que Prisma los mapea automáticamente.
    const newExamResult = await prisma.examResult.create({
      data: {
        studentId: studentId,  // Usar camelCase
        examTitle: examTitle,  // Usar camelCase
        score: score,
        maxScore: maxScore,    // Usar camelCase
        // createdAt se genera automáticamente por @default(now()) en el schema.prisma
      },
    });

    // 4. Retorna una respuesta de éxito
    console.log('Resultado de examen guardado exitosamente:', newExamResult);
    return NextResponse.json(
      { message: 'Resultados del examen guardados exitosamente', data: newExamResult },
      { status: 200 } // OK
    );

  } catch (error: any) {
    // 5. Manejo de errores
    console.error('Error al guardar resultados del examen:', error);
    // En caso de un error del servidor (por ejemplo, problema con la DB)
    return NextResponse.json(
      { message: `Error interno del servidor al guardar resultados: ${error.message || 'Desconocido'}` },
      { status: 500 } // Internal Server Error
    );
  }
}
