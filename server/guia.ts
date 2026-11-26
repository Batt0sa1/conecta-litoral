// Lógica compartida por las Pages Functions de la Guía del Litoral.
// Almacenamiento: Cloudflare KV (binding GUIA).
//   - clave "avisos"        → JSON con la lista completa de avisos
//   - clave "foto:<uuid>"   → imagen (bytes), con metadata { tipo }
import { idsCategorias } from '../src/data/categorias';
import { limpiarCaracteristicas, type Caracteristicas } from '../src/data/caracteristicas';

export interface Env {
  GUIA: KVNamespace;
  ADMIN_PASSWORD?: string;
}

export interface Aviso {
  id: string;
  categoria: string;
  nombre: string;
  sector: string;
  descripcion: string;
  whatsapp: string; // solo dígitos, ej: 56912345678 ('' si no tiene)
  web: string; // URL http(s) completa ('' si no tiene)
  instagram: string; // solo el usuario, sin @ ('' si no tiene)
  fotos: string[]; // ids de foto (sin el prefijo "foto:")
  caracteristicas: Caracteristicas; // campos propios de la categoría (src/data/caracteristicas.ts)
  publicado: boolean;
  creado: string;
  actualizado: string;
}

export const MAX_FOTOS = 8;
export const MAX_BYTES_FOTO = 3 * 1024 * 1024;
export const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];

const CLAVE_AVISOS = 'avisos';
const COOKIE = 'cl_admin';
const DURACION_SESION_S = 12 * 60 * 60;

// ---------- Respuestas ----------

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(status: number, mensaje: string): Response {
  return json({ error: mensaje }, { status });
}

// ---------- Avisos ----------

export async function leerAvisos(env: Env): Promise<Aviso[]> {
  const lista = await env.GUIA.get<Aviso[]>(CLAVE_AVISOS, 'json');
  return Array.isArray(lista) ? lista : [];
}

export async function guardarAvisos(env: Env, avisos: Aviso[]): Promise<void> {
  await env.GUIA.put(CLAVE_AVISOS, JSON.stringify(avisos));
}

export function ordenar(avisos: Aviso[]): Aviso[] {
  return [...avisos].sort((a, b) => b.actualizado.localeCompare(a.actualizado));
}

function texto(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** Deja solo dígitos y agrega el 56 de Chile a celulares escritos como 9XXXXXXXX. */
export function normalizarWhatsapp(v: unknown): string {
  let d = typeof v === 'string' ? v.replace(/\D/g, '') : '';
  if (d.length === 9 && d.startsWith('9')) d = '56' + d;
  return d.slice(0, 15);
}

/**
 * Sitio web: acepta "mirestaurant.cl", "www.mirestaurant.cl" o la URL completa.
 * Solo http/https (nunca javascript:, data:, etc.). Devuelve '' si viene vacío y null si no es válido.
 */
export function normalizarWeb(v: unknown): string | null {
  let t = typeof v === 'string' ? v.trim() : '';
  if (!t) return '';
  if (t.length > 200 || /\s/.test(t)) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(t)) t = 'https://' + t.replace(/^\/+/, '');
  try {
    const url = new URL(t);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.hostname.includes('.') || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Instagram: acepta "@usuario", "usuario" o el enlace "instagram.com/usuario".
 * Devuelve solo el usuario ('' si viene vacío) o null si no es válido.
 */
export function normalizarInstagram(v: unknown): string | null {
  let t = typeof v === 'string' ? v.trim() : '';
  if (!t) return '';
  const enlace = t.match(/instagram\.com\/([^/?#\s]+)/i);
  if (enlace) t = enlace[1];
  t = t.replace(/^@/, '').replace(/\/$/, '');
  return /^[A-Za-z0-9._]{1,30}$/.test(t) ? t.toLowerCase() : null;
}

/** Valida los datos que manda el panel. Devuelve el mensaje de error o los campos limpios. */
export function validarAviso(
  body: any,
): { error: string } | { datos: Omit<Aviso, 'id' | 'creado' | 'actualizado'> } {
  if (!body || typeof body !== 'object') return { error: 'Datos inválidos.' };
  const categoria = texto(body.categoria, 40);
  const nombre = texto(body.nombre, 120);
  const sector = texto(body.sector, 120);
  const descripcion = texto(body.descripcion, 2000);
  const whatsapp = normalizarWhatsapp(body.whatsapp);
  const web = normalizarWeb(body.web);
  const instagram = normalizarInstagram(body.instagram);
  const fotos = Array.isArray(body.fotos)
    ? body.fotos.filter((f: unknown) => typeof f === 'string' && /^[0-9a-f-]{36}$/.test(f))
    : [];

  if (!idsCategorias.includes(categoria)) return { error: 'Elige una categoría.' };
  if (!nombre) return { error: 'Falta el nombre del aviso.' };
  if (!sector) return { error: 'Falta el sector o comuna.' };
  if (!descripcion) return { error: 'Falta la descripción.' };
  if (whatsapp && whatsapp.length < 8) return { error: 'El WhatsApp no parece válido.' };
  if (web === null) return { error: 'El sitio web no parece válido. Ejemplo: www.mirestaurant.cl' };
  if (instagram === null) return { error: 'El Instagram no parece válido. Ejemplo: @mirestaurant' };
  if (fotos.length > MAX_FOTOS) return { error: `Máximo ${MAX_FOTOS} fotos por aviso.` };
  const c = limpiarCaracteristicas(categoria, body.caracteristicas);
  if ('error' in c) return { error: c.error };

  return {
    datos: {
      categoria, nombre, sector, descripcion, whatsapp, web, instagram, fotos,
      caracteristicas: c.caracteristicas,
      publicado: body.publicado !== false,
    },
  };
}

export async function borrarFotos(env: Env, ids: string[]): Promise<void> {
  await Promise.all(ids.map(id => env.GUIA.delete('foto:' + id)));
}

// ---------- Sesión del panel ----------

async function firmar(secreto: string, mensaje: string): Promise<string> {
  const clave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const firma = await crypto.subtle.sign('HMAC', clave, new TextEncoder().encode(mensaje));
  return [...new Uint8Array(firma)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function igualesSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Compara la contraseña sin filtrar su largo ni su contenido por el tiempo de respuesta. */
export async function passwordCorrecta(env: Env, intento: string): Promise<boolean> {
  const real = env.ADMIN_PASSWORD || '';
  if (!real) return false;
  const [a, b] = await Promise.all([firmar('pw', intento), firmar('pw', real)]);
  return igualesSeguro(a, b);
}

export async function crearCookieSesion(env: Env): Promise<string> {
  const vence = Math.floor(Date.now() / 1000) + DURACION_SESION_S;
  const firma = await firmar(env.ADMIN_PASSWORD!, 'sesion:' + vence);
  return `${COOKIE}=${vence}.${firma}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DURACION_SESION_S}`;
}

export function borrarCookieSesion(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function sesionValida(env: Env, request: Request): Promise<boolean> {
  if (!env.ADMIN_PASSWORD) return false;
  const cookies = request.headers.get('Cookie') || '';
  const valor = cookies
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(COOKIE + '='))
    ?.slice(COOKIE.length + 1);
  if (!valor) return false;
  const [vence, firma] = valor.split('.');
  if (!vence || !firma || Number(vence) < Date.now() / 1000) return false;
  return igualesSeguro(firma, await firmar(env.ADMIN_PASSWORD, 'sesion:' + vence));
}
