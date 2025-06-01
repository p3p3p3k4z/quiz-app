// test-db.js
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); // Para cargar tu .env

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Conexión a la base de datos exitosa desde test-db.js!');
    const questions = await prisma.question.findMany();
    console.log('Preguntas encontradas:', questions);
  } catch (error) {
    console.error('Error al conectar o consultar la base de datos desde test-db.js:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();