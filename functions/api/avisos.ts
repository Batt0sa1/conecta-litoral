// GET /api/avisos → avisos publicados de la Guía del Litoral (público).
import { json, leerAvisos, ordenar, type Env } from '../../server/guia';

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const avisos = ordenar((await leerAvisos(env)).filter(a => a.publicado)).map(
    ({ id, categoria, nombre, sector, descripcion, whatsapp, web, instagram, fotos, caracteristicas }) => ({
      id, categoria, nombre, sector, descripcion, whatsapp, web: web || '', instagram: instagram || '', fotos,
      caracteristicas: caracteristicas || {},
    }),
  );
  return json(avisos); // sin caché: los cambios del panel se ven al recargar
};
