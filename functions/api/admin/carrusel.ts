// GET    /api/admin/carrusel → { diapositivas, personalizado } (las predeterminadas si nunca se editó).
// PUT    /api/admin/carrusel → guarda la lista completa; borra las fotos subidas que ya no se usan.
// DELETE /api/admin/carrusel → vuelve al carrusel predeterminado y borra las fotos subidas.
import { diapositivasPredeterminadas, idFotoSubida, limpiarDiapositivas } from '../../../src/data/carrusel';
import { borrarFotos, error, guardarCarrusel, json, leerCarrusel, quitarCarrusel, type Env } from '../../../server/guia';

const fotosDe = (lista: { imagen: string }[] | null) => (lista || []).map(d => idFotoSubida(d.imagen)).filter(Boolean);

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const guardado = await leerCarrusel(env);
  return json({ diapositivas: guardado || diapositivasPredeterminadas, personalizado: !!guardado });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as { diapositivas?: unknown } | null;
  const r = limpiarDiapositivas(body?.diapositivas);
  if ('error' in r) return error(400, r.error);
  const anteriores = fotosDe(await leerCarrusel(env));
  await guardarCarrusel(env, r.diapositivas);
  const nuevas = new Set(fotosDe(r.diapositivas));
  await borrarFotos(env, anteriores.filter(id => !nuevas.has(id)));
  return json({ diapositivas: r.diapositivas, personalizado: true });
};

export const onRequestDelete: PagesFunction<Env> = async ({ env }) => {
  const anteriores = fotosDe(await leerCarrusel(env));
  await quitarCarrusel(env);
  await borrarFotos(env, anteriores);
  return json({ diapositivas: diapositivasPredeterminadas, personalizado: false });
};
