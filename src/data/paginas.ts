// Páginas de "La Fundación". Las usan el menú (Navbar.astro) y src/pages/[pagina].astro.
export interface PaginaFundacion {
  slug: string;
  nombre: string;
  titulo: string; // <title> para Google y al compartir
  descripcion: string; // meta description
  bajada: string; // texto bajo el título de la página
}

export const paginasFundacion: PaginaFundacion[] = [
  {
    slug: 'quienes-somos',
    nombre: 'Quiénes somos',
    titulo: 'Quiénes somos — Conecta Litoral',
    descripcion: 'Conecta Litoral es una fundación sin fines de lucro de Algarrobo. Conoce nuestra visión, misión y objetivo.',
    bajada: 'Nuestra visión, misión y objetivo.',
  },
  {
    slug: 'que-hacemos',
    nombre: '¿Qué hacemos?',
    titulo: '¿Qué hacemos? — Conecta Litoral',
    descripcion: 'Capacitaciones, ferias, actividades culturales, apoyo social, proyectos comunitarios y alianzas público-privadas en el litoral.',
    bajada: 'Seis líneas de acción que impulsan el desarrollo del litoral desde adentro.',
  },
  {
    slug: 'pilares',
    nombre: 'Pilares',
    titulo: 'Nuestros pilares — Conecta Litoral',
    descripcion: 'Comunidad, cultura e identidad, educación, emprendimiento local, inclusión y sostenibilidad: los pilares de Conecta Litoral.',
    bajada: 'Las áreas en las que trabaja la fundación.',
  },
  {
    slug: 'valores',
    nombre: 'Valores',
    titulo: 'Nuestros valores — Conecta Litoral',
    descripcion: 'Compromiso social, cercanía, transparencia y colaboración: los valores que guían a la comunidad de Conecta Litoral.',
    bajada: 'Los principios que guían a nuestra comunidad.',
  },
];
