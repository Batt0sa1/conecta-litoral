// POST /api/admin/login { password } → crea la sesión del panel.
import { crearCookieSesion, error, json, passwordCorrecta, type Env } from '../../../server/guia';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ADMIN_PASSWORD) return error(503, 'El panel no está configurado (falta ADMIN_PASSWORD).');
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const intento = typeof body?.password === 'string' ? body.password : '';
  if (!(await passwordCorrecta(env, intento))) {
    await new Promise(r => setTimeout(r, 1000)); // frena intentos por fuerza bruta
    return error(401, 'Contraseña incorrecta.');
  }
  return json({ ok: true }, { headers: { 'Set-Cookie': await crearCookieSesion(env) } });
};
