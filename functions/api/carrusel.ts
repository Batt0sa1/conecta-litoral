// GET /api/carrusel → { diapositivas } si se editó desde el panel, o { diapositivas: null } para
// que la portada use las predeterminadas (src/data/carrusel.ts) que ya vienen en el HTML.
import { json, leerCarrusel, type Env } from '../../server/guia';

export const onRequestGet: PagesFunction<Env> = async ({ env }) =>
  json({ diapositivas: await leerCarrusel(env) });
