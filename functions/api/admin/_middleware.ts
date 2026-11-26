// Protege todo /api/admin/* salvo el login. Las escrituras además exigen la cabecera
// X-Requested-With (la manda el panel), como defensa extra contra CSRF.
import { error, sesionValida, type Env } from '../../../server/guia';

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const ruta = new URL(request.url).pathname;
  if (ruta === '/api/admin/login') return next();
  if (!env.ADMIN_PASSWORD) return error(503, 'El panel no está configurado (falta ADMIN_PASSWORD).');
  if (!(await sesionValida(env, request))) return error(401, 'Tu sesión expiró. Vuelve a ingresar.');
  if (request.method !== 'GET' && request.headers.get('X-Requested-With') !== 'panel') {
    return error(403, 'Solicitud no permitida.');
  }
  return next();
};
