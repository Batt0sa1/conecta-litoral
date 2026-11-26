// GET  /api/admin/avisos → todos los avisos (publicados y ocultos).
// POST /api/admin/avisos → crea un aviso.
import { error, guardarAvisos, json, leerAvisos, ordenar, validarAviso, type Aviso, type Env } from '../../../server/guia';

export const onRequestGet: PagesFunction<Env> = async ({ env }) => json(ordenar(await leerAvisos(env)));

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const r = validarAviso(await request.json().catch(() => null));
  if ('error' in r) return error(400, r.error);
  const ahora = new Date().toISOString();
  const aviso: Aviso = { id: crypto.randomUUID(), ...r.datos, creado: ahora, actualizado: ahora };
  const avisos = await leerAvisos(env);
  avisos.push(aviso);
  await guardarAvisos(env, avisos);
  return json(aviso, { status: 201 });
};
