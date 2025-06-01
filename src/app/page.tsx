// src/app/page.tsx

import Link from 'next/link';
import Head from 'next/head'; // Mantener si lo usas para el <head> del documento

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12 font-sans">
      <Head>
        <title>Inicio - Cuestionario SO</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Bienvenido al Cuestionario de Sistemas Operativos
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Pon a prueba tus conocimientos sobre sistemas operativos.
          </p>
          <Link href="/questions" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg">
            Iniciar Cuestionario
          </Link>
        </div>
      </div>
    </div>
  );
}
