// POST /api/admin/logout → cierra la sesión.
import { borrarCookieSesion, json, type Env } from '../../../server/guia';

export const onRequestPost: PagesFunction<Env> = async () =>
  json({ ok: true }, { headers: { 'Set-Cookie': borrarCookieSesion() } });
