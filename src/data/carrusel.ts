// Carrusel de portada: diapositivas predeterminadas y validación.
// Las predeterminadas usan fotos de public/images/carrusel/. Desde el panel /admin se puede
// reemplazar el carrusel completo; esa versión se guarda en KV (clave "carrusel") y la sirve /api/carrusel.

export interface Diapositiva {
  /** '/images/carrusel/<archivo>.webp' (foto del sitio) o '/api/fotos/<uuid>' (subida desde el panel). */
  imagen: string;
  /** Texto alternativo para lectores de pantalla. */
  alt: string;
  /** Si viene vacío, la diapositiva muestra solo la imagen (útil para afiches que ya traen texto). */
  titulo: string;
  texto: string;
  botonTexto: string;
  /** '#seccion' del sitio o enlace https://. */
  botonEnlace: string;
}

export const MAX_DIAPOSITIVAS = 8;

/** Secciones a las que puede llevar el botón (el panel las ofrece en una lista). */
export const ENLACES_INTERNOS: { valor: string; nombre: string }[] = [
  { valor: '#guia', nombre: 'Guía del Litoral' },
  { valor: '#publicar', nombre: 'Formulario "Publica tu aviso"' },
  { valor: '#fundacion', nombre: 'La Fundación' },
  { valor: '#asesorias', nombre: 'Asesorías' },
  { valor: '#galeria', nombre: 'Galería' },
  { valor: '#contacto', nombre: 'Contacto' },
];

export const diapositivasPredeterminadas: Diapositiva[] = [
  {
    imagen: '/images/carrusel/algarrobo.webp',
    alt: 'Grupo de la comunidad Conecta Litoral saludando frente al letrero de Algarrobo',
    titulo: 'Conectando ideas, personas y territorios',
    texto: 'Emprendimiento, servicios y alojamientos del litoral, en un solo lugar y con el respaldo de la fundación.',
    botonTexto: 'Ver Guía del Litoral',
    botonEnlace: '#guia',
  },
  {
    imagen: '/images/carrusel/redes-y-conexiones.webp',
    alt: 'Afiche: Conecta Litoral, red de turismo y emprendimiento local. Estamos generando redes y conexiones para el turismo. Comunidad activa, alianzas locales, experiencias turísticas y más oportunidades.',
    titulo: '',
    texto: '',
    botonTexto: 'Conoce la fundación',
    botonEnlace: '#fundacion',
  },
  {
    imagen: '/images/carrusel/gastronomia-local.webp',
    alt: 'Grupo de vecinos junto al equipo de un restaurante local',
    titulo: 'Juntos impulsamos el turismo local',
    texto: 'Recorridos, gastronomía y experiencias que conectan a la comunidad con los emprendedores del litoral.',
    botonTexto: 'Ver Guía del Litoral',
    botonEnlace: '#guia',
  },
  {
    imagen: '/images/carrusel/pendon-fundacion.webp',
    alt: 'Integrantes de la fundación junto al pendón de Conecta Litoral en una feria de Turismo Algarrobo',
    titulo: 'Conectamos ideas, impulsamos negocios',
    texto: 'Creamos redes, entregamos herramientas y potenciamos el desarrollo local con turismo sostenible y alianzas.',
    botonTexto: 'Ver asesorías',
    botonEnlace: '#asesorias',
  },
  {
    imagen: '/images/carrusel/pueblo-de-artesanos.webp',
    alt: 'Vecinas conversando en una mesa del Pueblo de Artesanos',
    titulo: 'Emprendimiento local en el litoral',
    texto: 'Ferias, artesanía y productos locales. Publica tu emprendimiento en la Guía del Litoral.',
    botonTexto: 'Publica tu aviso',
    botonEnlace: '#publicar',
  },
];

const RE_IMAGEN = /^\/(images\/carrusel\/[a-z0-9-]+\.(webp|jpg|jpeg|png)|api\/fotos\/[0-9a-f-]{36})$/;
const RE_ANCLA = /^#[a-z0-9-]+$/;

function texto(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

/** Valida el enlace del botón: un ancla del sitio o una URL http(s). Devuelve null si no es válido. */
export function normalizarEnlace(v: unknown): string | null {
  const t = typeof v === 'string' ? v.trim() : '';
  if (!t) return '';
  if (RE_ANCLA.test(t)) return t;
  let u = t;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u.replace(/^\/+/, '');
  try {
    const url = new URL(u);
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !url.hostname.includes('.') || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

/** Valida y limpia la lista que manda el panel. */
export function limpiarDiapositivas(entrada: unknown): { error: string } | { diapositivas: Diapositiva[] } {
  if (!Array.isArray(entrada)) return { error: 'Datos inválidos.' };
  if (entrada.length === 0) return { error: 'El carrusel necesita al menos una diapositiva.' };
  if (entrada.length > MAX_DIAPOSITIVAS) return { error: `Máximo ${MAX_DIAPOSITIVAS} diapositivas.` };
  const diapositivas: Diapositiva[] = [];
  for (const [i, d] of entrada.entries()) {
    const n = i + 1;
    if (!d || typeof d !== 'object') return { error: `Diapositiva ${n}: datos inválidos.` };
    const imagen = typeof d.imagen === 'string' ? d.imagen : '';
    if (!RE_IMAGEN.test(imagen)) return { error: `Diapositiva ${n}: falta la imagen.` };
    const titulo = texto(d.titulo, 90);
    const botonTexto = texto(d.botonTexto, 30);
    const botonEnlace = normalizarEnlace(d.botonEnlace);
    if (botonEnlace === null) return { error: `Diapositiva ${n}: el enlace del botón no es válido.` };
    if (botonTexto && !botonEnlace) return { error: `Diapositiva ${n}: elige a dónde lleva el botón.` };
    diapositivas.push({
      imagen,
      alt: texto(d.alt, 300) || titulo || 'Imagen de Conecta Litoral',
      titulo,
      texto: texto(d.texto, 220),
      botonTexto: botonEnlace ? botonTexto : '',
      botonEnlace: botonTexto ? botonEnlace : '',
    });
  }
  return { diapositivas };
}

/** Id de la foto en KV si la imagen fue subida desde el panel ('' si es una foto fija del sitio). */
export function idFotoSubida(imagen: string): string {
  const m = imagen.match(/^\/api\/fotos\/([0-9a-f-]{36})$/);
  return m ? m[1] : '';
}
