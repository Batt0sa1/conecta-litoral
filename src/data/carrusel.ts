// Carrusel de portada: solo imágenes (sin títulos ni textos encima).
// Las predeterminadas usan fotos de public/images/carrusel/. Desde el panel /admin se puede
// reemplazar el carrusel completo; esa versión se guarda en KV (clave "carrusel") y la sirve /api/carrusel.

export interface Diapositiva {
  /** '/images/carrusel/<archivo>.webp' (foto del sitio) o '/api/fotos/<uuid>' (subida desde el panel). */
  imagen: string;
  /** Descripción para lectores de pantalla y Google (no se muestra). Si la imagen trae texto, va aquí. */
  alt: string;
  /** Opcional: a dónde lleva al hacer clic en la imagen ('#seccion', '/pagina/' o https://). */
  enlace: string;
}

export const MAX_DIAPOSITIVAS = 8;

/** Destinos que el panel ofrece en una lista para el enlace de la imagen. */
export const ENLACES_INTERNOS: { valor: string; nombre: string }[] = [
  { valor: '#guia', nombre: 'Guía del Litoral' },
  { valor: '#publicar', nombre: 'Formulario "Publica tu aviso"' },
  { valor: '#asesorias', nombre: 'Asesorías' },
  { valor: '#galeria', nombre: 'Galería' },
  { valor: '#contacto', nombre: 'Contacto' },
  { valor: '/quienes-somos/', nombre: 'Página: Quiénes somos' },
  { valor: '/que-hacemos/', nombre: 'Página: ¿Qué hacemos?' },
  { valor: '/pilares/', nombre: 'Página: Pilares' },
  { valor: '/valores/', nombre: 'Página: Valores' },
];

export const diapositivasPredeterminadas: Diapositiva[] = [
  {
    imagen: '/images/carrusel/algarrobo.webp',
    alt: 'Grupo de la comunidad Conecta Litoral saludando frente al letrero de Algarrobo',
    enlace: '',
  },
  {
    imagen: '/images/carrusel/redes-y-conexiones.webp',
    alt: 'Afiche: Conecta Litoral, red de turismo y emprendimiento local. Estamos generando redes y conexiones para el turismo. Comunidad activa, alianzas locales, experiencias turísticas y más oportunidades. Juntos impulsamos el turismo local.',
    enlace: '',
  },
  {
    imagen: '/images/carrusel/gastronomia-local.webp',
    alt: 'Grupo de vecinos junto al equipo de un restaurante local',
    enlace: '',
  },
  {
    imagen: '/images/carrusel/pendon-fundacion.webp',
    alt: 'Integrantes de la fundación junto al pendón de Conecta Litoral: conectamos ideas, impulsamos negocios',
    enlace: '',
  },
  {
    imagen: '/images/carrusel/pueblo-de-artesanos.webp',
    alt: 'Vecinas conversando en una mesa del Pueblo de Artesanos',
    enlace: '',
  },
];

const RE_IMAGEN = /^\/(images\/carrusel\/[a-z0-9-]+\.(webp|jpg|jpeg|png)|api\/fotos\/[0-9a-f-]{36})$/;
const RE_ANCLA = /^#[a-z0-9-]+$/;
const RE_PAGINA = /^\/[a-z0-9-]+\/$/;

function texto(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

/** Valida el enlace: ancla o página del sitio, o una URL http(s). Devuelve '' si viene vacío y null si no es válido. */
export function normalizarEnlace(v: unknown): string | null {
  const t = typeof v === 'string' ? v.trim() : '';
  if (!t) return '';
  if (RE_ANCLA.test(t) || RE_PAGINA.test(t)) return t;
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

/** Valida y limpia la lista que manda el panel (descarta cualquier otro campo). */
export function limpiarDiapositivas(entrada: unknown): { error: string } | { diapositivas: Diapositiva[] } {
  if (!Array.isArray(entrada)) return { error: 'Datos inválidos.' };
  if (entrada.length === 0) return { error: 'El carrusel necesita al menos una imagen.' };
  if (entrada.length > MAX_DIAPOSITIVAS) return { error: `Máximo ${MAX_DIAPOSITIVAS} imágenes.` };
  const diapositivas: Diapositiva[] = [];
  for (const [i, d] of entrada.entries()) {
    const n = i + 1;
    if (!d || typeof d !== 'object') return { error: `Imagen ${n}: datos inválidos.` };
    const imagen = typeof d.imagen === 'string' ? d.imagen : '';
    if (!RE_IMAGEN.test(imagen)) return { error: `Imagen ${n}: falta la foto.` };
    const enlace = normalizarEnlace(d.enlace);
    if (enlace === null) return { error: `Imagen ${n}: el enlace no es válido.` };
    diapositivas.push({ imagen, alt: texto(d.alt, 300) || 'Imagen de Conecta Litoral', enlace });
  }
  return { diapositivas };
}

/** Id de la foto en KV si la imagen fue subida desde el panel ('' si es una foto fija del sitio). */
export function idFotoSubida(imagen: string): string {
  const m = imagen.match(/^\/api\/fotos\/([0-9a-f-]{36})$/);
  return m ? m[1] : '';
}
