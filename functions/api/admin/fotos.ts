// POST /api/admin/fotos (cuerpo = la imagen) → guarda la foto y devuelve su id.
// El panel achica las fotos en el navegador antes de subirlas.
import { MAX_BYTES_FOTO, TIPOS_FOTO, error, json, type Env } from '../../../server/guia';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const tipo = (request.headers.get('Content-Type') || '').split(';')[0].trim();
  if (!TIPOS_FOTO.includes(tipo)) return error(415, 'Formato no permitido. Usa JPG, PNG o WebP.');
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) return error(400, 'La foto está vacía.');
  if (bytes.byteLength > MAX_BYTES_FOTO) return error(413, 'La foto es demasiado grande (máximo 3 MB).');
  const id = crypto.randomUUID();
  await env.GUIA.put('foto:' + id, bytes, { metadata: { tipo } });
  return json({ id }, { status: 201 });
};
