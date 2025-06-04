// src/app/page.tsx
import Link from 'next/link';
import AvatarDisplay from '@/components/AvatarDisplay'; // Importa el componente cliente para avatares

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row items-center justify-center p-4 font-sans">
      {/* Contenido principal izquierdo */}
      <div className="flex-1 max-w-2xl text-center lg:text-left p-8 lg:p-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Encuentra problemas de seguridad <span className="text-blue-600">antes que los atacantes</span> lo hagan.
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10">
          Descubre vulnerabilidades ocultas, evalúa tu exposición al riesgo y fortalece las defensas antes de que los ciberdelincuentes exploten las debilidades. ¿Estás preparado?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          {/* Botón para Iniciar Sesión */}
          <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors duration-300 shadow-lg text-xl">
            Iniciar Sesión
          </Link>
          {/* Botón para Empezar Cuestionario como Invitado */}
          <Link href="/questions" className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-colors duration-300 shadow-lg text-xl">
            Empezar Cuestionario (Invitado)
          </Link>
        </div>
      </div>

      {/* Sección derecha con fondo oscuro */}
      <div className="flex-1 max-w-md lg:max-w-xl bg-gradient-to-br from-purple-800 to-red-800 text-white rounded-3xl p-8 md:p-10 shadow-xl mt-10 lg:mt-0 lg:ml-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
          ¡Haz el cuestionario de evaluación de riesgos de 4 minutos y obtén un informe personalizado de tu ciberseguridad!
        </h2>
        {/* Usar el nuevo Client Component para los avatares */}
        <AvatarDisplay />
      </div>
    </div>
  );
}
