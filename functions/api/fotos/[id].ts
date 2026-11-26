// GET /api/fotos/:id → imagen de un aviso (pública; los ids no se reutilizan, así que se cachea fuerte).
import type { Env } from '../../../server/guia';

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = String(params.id);
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response('No encontrada', { status: 404 });
  const { value, metadata } = await env.GUIA.getWithMetadata<{ tipo?: string }>('foto:' + id, 'arrayBuffer');
  if (!value) return new Response('No encontrada', { status: 404 });
  return new Response(value, {
    headers: {
      'Content-Type': metadata?.tipo || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
