// Características de cada tipo de aviso de la Guía del Litoral.
// Un solo lugar para definirlas: el panel /admin dibuja el formulario a partir de esto,
// la API (server/guia.ts) valida con `limpiarCaracteristicas` y la Guía muestra los datos
// con `describirCaracteristicas`. Para agregar un campo nuevo basta con sumarlo aquí.

export type TipoCampo = 'opciones' | 'multi' | 'numero' | 'texto' | 'si_no';

export interface Campo {
  id: string;
  etiqueta: string;
  tipo: TipoCampo;
  /** Para 'opciones' (elige una) y 'multi' (elige varias). */
  opciones?: string[];
  /** Para 'numero': rango permitido y unidad en singular/plural ("1 persona", "4 personas"). */
  min?: number;
  max?: number;
  unidad?: [string, string];
  /** Para 'texto'. */
  placeholder?: string;
  maxLargo?: number;
  /** Para 'si_no': texto que se muestra en el aviso cuando la respuesta es sí. */
  textoSi?: string;
  /** Se muestra como etiqueta destacada arriba de la descripción del aviso. */
  destacado?: boolean;
  requerido?: boolean;
  ayuda?: string;
}

export type Valor = string | number | boolean | string[];
export type Caracteristicas = Record<string, Valor>;

const PAGOS = ['Efectivo', 'Débito', 'Crédito', 'Transferencia'];
const HORARIO: Campo = {
  id: 'horario', etiqueta: 'Horario de atención', tipo: 'texto', maxLargo: 120,
  placeholder: 'Ej: Lun a sáb 9:00 a 19:00',
};

export const camposPorCategoria: Record<string, Campo[]> = {
  alojamientos: [
    { id: 'tipo', etiqueta: 'Tipo de alojamiento', tipo: 'opciones', requerido: true, destacado: true,
      opciones: ['Cabaña', 'Casa', 'Departamento', 'Habitación', 'Camping', 'Hostal', 'Otro'] },
    { id: 'modalidad', etiqueta: 'Modalidad de arriendo', tipo: 'multi', destacado: true,
      opciones: ['Por noche', 'Fin de semana', 'Temporada de verano', 'Mensual', 'Anual'] },
    { id: 'capacidad', etiqueta: 'Capacidad', tipo: 'numero', min: 1, max: 50, unidad: ['persona', 'personas'], destacado: true },
    { id: 'dormitorios', etiqueta: 'Dormitorios', tipo: 'numero', min: 0, max: 20, unidad: ['dormitorio', 'dormitorios'], destacado: true },
    { id: 'banos', etiqueta: 'Baños', tipo: 'numero', min: 0, max: 10, unidad: ['baño', 'baños'] },
    { id: 'distancia_playa', etiqueta: 'Distancia a la playa', tipo: 'opciones', destacado: true,
      opciones: ['Frente al mar', 'A menos de 500 m', 'Entre 500 m y 1 km', 'A más de 1 km'] },
    { id: 'comodidades', etiqueta: 'Comodidades', tipo: 'multi',
      opciones: ['Estacionamiento', 'WiFi', 'Quincho o parrilla', 'Piscina', 'Vista al mar', 'Terraza', 'Calefacción',
        'Cocina equipada', 'Lavadora', 'TV', 'Ropa de cama y toallas'] },
    { id: 'mascotas', etiqueta: 'Admite mascotas', tipo: 'si_no', textoSi: 'Admite mascotas', destacado: true },
    { id: 'precio', etiqueta: 'Precio referencial', tipo: 'texto', maxLargo: 80,
      placeholder: 'Ej: Desde $60.000 por noche', ayuda: 'Opcional. Déjalo vacío para que lo consulten por WhatsApp.' },
  ],
  restaurantes: [
    { id: 'tipo', etiqueta: 'Tipo de local', tipo: 'opciones', requerido: true, destacado: true,
      opciones: ['Restaurante', 'Cafetería', 'Picada', 'Bar', 'Pastelería o panadería', 'Comida rápida', 'Foodtruck', 'Otro'] },
    { id: 'cocina', etiqueta: 'Tipo de cocina', tipo: 'multi', destacado: true,
      opciones: ['Pescados y mariscos', 'Chilena', 'Pizzas', 'Sushi', 'Hamburguesas y sándwiches', 'Vegetariana o vegana',
        'Repostería', 'Internacional'] },
    { id: 'servicio', etiqueta: 'Servicio', tipo: 'multi', destacado: true,
      opciones: ['Para servir', 'Para llevar', 'Delivery', 'Acepta reservas'] },
    { ...HORARIO },
    { id: 'precios', etiqueta: 'Rango de precios', tipo: 'opciones',
      opciones: ['$ (económico)', '$$ (intermedio)', '$$$ (alto)'] },
    { id: 'pagos', etiqueta: 'Formas de pago', tipo: 'multi', opciones: PAGOS },
    { id: 'estacionamiento', etiqueta: 'Estacionamiento', tipo: 'si_no', textoSi: 'Con estacionamiento' },
    { id: 'mascotas', etiqueta: 'Pet friendly', tipo: 'si_no', textoSi: 'Pet friendly' },
  ],
  servicios: [
    { id: 'rubro', etiqueta: 'Rubro', tipo: 'opciones', requerido: true, destacado: true,
      opciones: ['Gasfitería', 'Electricidad', 'Construcción y remodelación', 'Carpintería', 'Pintura', 'Jardinería',
        'Aseo', 'Mantención de piscinas', 'Transporte y fletes', 'Mecánica', 'Computación y celulares',
        'Cuidado de casas', 'Otro'] },
    { id: 'cobertura', etiqueta: 'Zona que cubre', tipo: 'texto', maxLargo: 120, destacado: true,
      placeholder: 'Ej: Algarrobo, El Quisco y Mirasol' },
    { ...HORARIO },
    { id: 'urgencias', etiqueta: 'Atiende urgencias', tipo: 'si_no', textoSi: 'Atiende urgencias', destacado: true },
    { id: 'presupuesto', etiqueta: 'Presupuesto sin costo', tipo: 'si_no', textoSi: 'Presupuesto sin costo', destacado: true },
    { id: 'certificado', etiqueta: 'Certificación', tipo: 'texto', maxLargo: 80,
      placeholder: 'Ej: Instalador autorizado SEC', ayuda: 'Opcional: certificados o autorizaciones que tenga.' },
    { id: 'pagos', etiqueta: 'Formas de pago', tipo: 'multi', opciones: PAGOS },
  ],
  comercio: [
    { id: 'rubro', etiqueta: 'Rubro', tipo: 'opciones', requerido: true, destacado: true,
      opciones: ['Almacén', 'Artesanía', 'Ropa y accesorios', 'Productos locales', 'Panadería', 'Ferretería',
        'Plantas y flores', 'Productos naturales', 'Otro'] },
    { ...HORARIO },
    { id: 'venta', etiqueta: 'Formas de venta', tipo: 'multi', destacado: true,
      opciones: ['Local físico', 'Feria', 'Venta online', 'Despacho a domicilio'] },
    { id: 'pagos', etiqueta: 'Formas de pago', tipo: 'multi', opciones: PAGOS },
  ],
  turismo: [
    { id: 'tipo', etiqueta: 'Tipo de actividad', tipo: 'opciones', requerido: true, destacado: true,
      opciones: ['Tour o paseo', 'Deportes náuticos', 'Pesca', 'Cabalgata', 'Trekking', 'Clases y talleres',
        'Arriendo de equipos', 'Otro'] },
    { id: 'duracion', etiqueta: 'Duración', tipo: 'texto', maxLargo: 60, destacado: true, placeholder: 'Ej: 2 horas' },
    { id: 'temporada', etiqueta: 'Temporada', tipo: 'opciones', destacado: true,
      opciones: ['Todo el año', 'Solo verano', 'Fines de semana', 'Consultar fechas'] },
    { id: 'grupo', etiqueta: 'Máximo por grupo', tipo: 'numero', min: 1, max: 200, unidad: ['persona', 'personas'] },
    { id: 'edad_minima', etiqueta: 'Edad mínima', tipo: 'numero', min: 0, max: 99, unidad: ['año', 'años'] },
    { id: 'incluye_equipo', etiqueta: 'Incluye equipo', tipo: 'si_no', textoSi: 'Incluye equipo' },
    { id: 'reserva', etiqueta: 'Requiere reserva', tipo: 'si_no', textoSi: 'Requiere reserva' },
    { id: 'precio', etiqueta: 'Precio referencial', tipo: 'texto', maxLargo: 80,
      placeholder: 'Ej: $15.000 por persona', ayuda: 'Opcional. Déjalo vacío para que lo consulten por WhatsApp.' },
  ],
  salud: [
    { id: 'tipo', etiqueta: 'Tipo de servicio', tipo: 'opciones', requerido: true, destacado: true,
      opciones: ['Masajes', 'Terapias complementarias', 'Kinesiología', 'Psicología', 'Nutrición', 'Estética y belleza',
        'Peluquería y barbería', 'Yoga o pilates', 'Gimnasio', 'Otro'] },
    { id: 'modalidad', etiqueta: 'Modalidad', tipo: 'multi', destacado: true,
      opciones: ['Presencial', 'A domicilio', 'Online'] },
    { ...HORARIO },
    { id: 'reserva', etiqueta: 'Atención con hora', tipo: 'si_no', textoSi: 'Atención con hora previa' },
    { id: 'titulo', etiqueta: 'Título o certificación', tipo: 'texto', maxLargo: 80,
      placeholder: 'Ej: Kinesióloga titulada', ayuda: 'Opcional.' },
    { id: 'pagos', etiqueta: 'Formas de pago', tipo: 'multi', opciones: PAGOS },
  ],
};

/**
 * Valida y limpia las características según la categoría: descarta campos desconocidos y
 * valores fuera de las opciones o del rango. Devuelve un error si falta un campo requerido.
 */
export function limpiarCaracteristicas(
  categoria: string,
  entrada: unknown,
): { error: string } | { caracteristicas: Caracteristicas } {
  const campos = camposPorCategoria[categoria] || [];
  const datos = entrada && typeof entrada === 'object' && !Array.isArray(entrada) ? (entrada as Record<string, unknown>) : {};
  const limpio: Caracteristicas = {};

  for (const c of campos) {
    const v = datos[c.id];
    switch (c.tipo) {
      case 'opciones':
        if (typeof v === 'string' && c.opciones!.includes(v)) limpio[c.id] = v;
        break;
      case 'multi':
        if (Array.isArray(v)) {
          const elegidas = c.opciones!.filter(o => v.includes(o));
          if (elegidas.length) limpio[c.id] = elegidas;
        }
        break;
      case 'numero': {
        const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
        if (Number.isInteger(n) && n >= (c.min ?? 0) && n <= (c.max ?? 9999)) limpio[c.id] = n;
        break;
      }
      case 'texto':
        if (typeof v === 'string' && v.trim()) limpio[c.id] = v.trim().slice(0, c.maxLargo ?? 120);
        break;
      case 'si_no':
        if (v === true) limpio[c.id] = true; // un "no" no se guarda ni se muestra
        break;
    }
    if (c.requerido && limpio[c.id] === undefined) return { error: `Falta completar: ${c.etiqueta}.` };
  }
  return { caracteristicas: limpio };
}

/** Texto para mostrar el valor de un campo en el aviso. */
export function formatearValor(c: Campo, v: Valor): string {
  if (c.tipo === 'numero' && typeof v === 'number') return c.unidad ? `${v} ${v === 1 ? c.unidad[0] : c.unidad[1]}` : String(v);
  if (c.tipo === 'si_no') return c.textoSi || c.etiqueta;
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

/**
 * Separa las características de un aviso en:
 *  - destacadas: etiquetas cortas para mostrar arriba (ej: "Cabaña", "4 personas", "Admite mascotas")
 *  - detalles: el resto, como pares etiqueta/valor para "Más detalles"
 */
export function describirCaracteristicas(categoria: string, valores: Caracteristicas | undefined) {
  const destacadas: string[] = [];
  const detalles: { etiqueta: string; valor: string }[] = [];
  if (!valores) return { destacadas, detalles };
  for (const c of camposPorCategoria[categoria] || []) {
    const v = valores[c.id];
    if (v === undefined || v === '' || v === false || (Array.isArray(v) && !v.length)) continue;
    if (c.destacado) {
      if (c.tipo === 'multi' && Array.isArray(v)) destacadas.push(...v);
      else destacadas.push(formatearValor(c, v));
    } else {
      detalles.push({ etiqueta: c.etiqueta, valor: formatearValor(c, v) });
    }
  }
  return { destacadas, detalles };
}
