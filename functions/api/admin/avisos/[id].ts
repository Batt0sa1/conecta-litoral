// PUT    /api/admin/avisos/:id → actualiza un aviso (borra las fotos que se quitaron).
// DELETE /api/admin/avisos/:id → borra el aviso y sus fotos.
import { borrarFotos, error, guardarAvisos, json, leerAvisos, validarAviso, type Env } from '../../../../server/guia';

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const r = validarAviso(await request.json().catch(() => null));
  if ('error' in r) return error(400, r.error);
  const avisos = await leerAvisos(env);
  const i = avisos.findIndex(a => a.id === params.id);
  if (i === -1) return error(404, 'El aviso ya no existe.');
  const quitadas = avisos[i].fotos.filter(f => !r.datos.fotos.includes(f));
  avisos[i] = { ...avisos[i], ...r.datos, actualizado: new Date().toISOString() };
  await guardarAvisos(env, avisos);
  await borrarFotos(env, quitadas);
  return json(avisos[i]);
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const avisos = await leerAvisos(env);
  const aviso = avisos.find(a => a.id === params.id);
  if (!aviso) return error(404, 'El aviso ya no existe.');
  await guardarAvisos(env, avisos.filter(a => a.id !== aviso.id));
  await borrarFotos(env, aviso.fotos);
  return json({ ok: true });
};
