// GET /api/admin/sesion → 200 si la sesión es válida (el middleware ya la revisó).
import { json, type Env } from '../../../server/guia';

export const onRequestGet: PagesFunction<Env> = async () => json({ ok: true });
