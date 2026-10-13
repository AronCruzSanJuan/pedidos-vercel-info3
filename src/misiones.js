// ============================================================================
//  MISIONES — Sistema de Pedidos y Clientes · Informática III (Grupo 1301)
// ============================================================================
//  Este es el ÚNICO archivo de lógica que vas a modificar.
//
//  Cada función está "vacía" a propósito. Tu sitio publicado en Vercel tiene un
//  panel de verificación que corre casos de prueba contra estas funciones y te
//  dice cuál falla, qué esperaba y qué obtuvo. Lee el caso que falla ANTES de
//  cambiar código: así se trabaja con pruebas unitarias (lo verás en 3.4).
//
//  Puedes verificar sin publicar con:  npm run verificar
//
//  Orden recomendado: 1 → 2 → 3 → 4 → 5. La 6 es para Destacado.
// ============================================================================

import { ESTADOS } from './datos.js'

// ----------------------------------------------------------------------------
// MISIÓN 1 · RF3 — ¿Cuánto paga el cliente?
// ----------------------------------------------------------------------------
// Recibe un pedido: { items: [{ cantidad, precioUnitario }], descuento }
//   - subtotal = suma de (cantidad × precioUnitario) de cada item
//   - descuento es una fracción (0.1 = 10 %). Si no viene, es 0.
//   - total = subtotal × (1 − descuento), REDONDEADO a 2 decimales.
//   - Un pedido sin items cuesta 0.
// Pista: prueba en la consola 0.1 + 0.2 y verás por qué hay que redondear.
//        Math.round(x * 100) / 100
export function totalPedido(pedido) {
  if (!pedido || !pedido.items || pedido.items.length === 0) {
    return 0;
  }
  
  // Suma de (cantidad * precioUnitario) de cada item
  const subtotal = pedido.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
  
  // Si no viene descuento, es 0
  const descuento = pedido.descuento !== undefined ? pedido.descuento : 0;
  
  // Total = subtotal * (1 - descuento), redondeado a 2 decimales
  const total = subtotal * (1 - descuento);
  return Math.round(total * 100) / 100;
}

// ----------------------------------------------------------------------------
// MISIÓN 2 · RF4 — ¿Este cambio de estado es válido?
// ----------------------------------------------------------------------------
// Los estados avanzan en orden y SOLO un paso a la vez:
//   registrado → en_preparacion → listo → entregado
// Devuelve true únicamente si `nuevo` es el estado inmediatamente siguiente
// de `actual`. Saltar pasos, regresar o moverse desde "entregado" es false.
// Un estado que no existe también es false.
// Pista: ESTADOS ya es un arreglo ordenado. ¿Qué te dice indexOf?
export function puedeTransicionar(actual, nuevo) {
  // Encuentra los índices de los estados en el arreglo ESTADOS
  const indexActual = ESTADOS.indexOf(actual);
  const indexNuevo = ESTADOS.indexOf(nuevo);
  
  // Si alguno de los estados no existe, devuelve false
  if (indexActual === -1 || indexNuevo === -1) {
    return false;
  }
  
  // Devuelve true únicamente si "nuevo" es el estado inmediatamente siguiente a "actual"
  return indexNuevo === indexActual + 1;
}

// ----------------------------------------------------------------------------
// MISIÓN 3 · RF1 — ¿Los datos del cliente son válidos?
// ----------------------------------------------------------------------------
// Recibe { nombre, telefono, email } y devuelve un ARREGLO con los códigos de
// error que apliquen, en este orden. Si todo está bien, devuelve [].
//   'nombre_requerido'  → nombre vacío o solo espacios
//   'telefono_invalido' → después de quitar espacios y guiones, no son
//                         exactamente 10 dígitos
//   'email_invalido'    → el email VIENE (no está vacío) y no tiene forma de
//                         correo: algo@algo.algo   (el email es opcional)
// Pista: '55 1234-5678'.replace(/[\s-]/g, '')   y   /^\d{10}$/.test(...)
export function validarCliente(cliente) {
  const errores = [];

  // 1. Validar nombre: requerido, vacío o solo espacios
  if (!cliente || !cliente.nombre || cliente.nombre.trim() === '') {
    errores.push('nombre_requerido');
  }

  // 2. Validar teléfono: después de quitar espacios y guiones, deben ser exactamente 10 dígitos
  if (cliente && cliente.telefono) {
    const telefonoLimpio = String(cliente.telefono).replace(/[\s-]/g, '');
    if (!/^\d{10}$/.test(telefonoLimpio)) {
      errores.push('telefono_invalido');
    }
  } else {
    errores.push('telefono_invalido');
  }

  // 3. Validar email: si viene (no está vacío), debe tener forma de correo (algo@algo.algo)
  if (cliente && cliente.email && cliente.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cliente.email)) {
      errores.push('email_invalido');
    }
  }

  return errores;
}

// ----------------------------------------------------------------------------
// MISIÓN 4 · RF5 — ¿Cuántos pedidos hay en cada estado?
// ----------------------------------------------------------------------------
// Devuelve un objeto con TODOS los estados como llave, aunque tengan 0:
//   { registrado: 3, en_preparacion: 3, listo: 2, entregado: 2 }
// Con una lista vacía, todos van en 0.
export function resumenPorEstado(pedidos) {
  const resumen = {};
  
  // Inicializar todos los estados en 0 para no olvidar los casos en cero
  ESTADOS.forEach(estado => {
    resumen[estado] = 0;
  });
  
  // Contar los pedidos según su estado actual
  if (pedidos && Array.isArray(pedidos)) {
    pedidos.forEach(pedido => {
      if (pedido && pedido.estado && resumen.hasOwnProperty(pedido.estado)) {
        resumen[pedido.estado]++;
      }
    });
  }
  
  return resumen;
}

// ----------------------------------------------------------------------------
// MISIÓN 5 · RF5 — Buscar pedidos por nombre de cliente
// ----------------------------------------------------------------------------
// Devuelve los pedidos cuyo cliente CONTIENE el texto buscado, sin importar
// mayúsculas ni acentos: "ramirez" encuentra a "Ana Ramírez" y "JOSÉ" a
// "José Martínez". Un texto vacío (o solo espacios) devuelve todos.
// Pista: 'Ramírez'.normalize('NFD').replace(/[̀-ͯ]/g, '')
//        Investiga qué hace NFD. Es un problema real en sistemas en español.

export function buscarPedidos(pedidos, texto) {
  if (!Array.isArray(pedidos)) return [];

  const normalizar = (str) =>
    String(str ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quita los acentos
      .toLowerCase()
      .trim();

  const busqueda = normalizar(texto);

  // Texto vacío (o solo espacios) → devuelve todos
  if (busqueda === '') return [...pedidos];

  return pedidos.filter(
    (pedido) =>
      pedido &&
      typeof pedido.cliente === 'string' &&
      normalizar(pedido.cliente).includes(busqueda)
  );
}
// ----------------------------------------------------------------------------
// MISIÓN 6 · DESTACADO — Los mejores clientes
// ----------------------------------------------------------------------------
export function topClientes(pedidos, n) {
  if (!pedidos || !Array.isArray(pedidos) || n <= 0) {
    return [];
  }

  const acumuladoClientes = {};

  pedidos.forEach(pedido => {
    if (pedido && pedido.cliente) {
      const nombre = typeof pedido.cliente === 'string' ? pedido.cliente : pedido.cliente.nombre;
      if (nombre) {
        const total = totalPedido(pedido);

        if (!acumuladoClientes[nombre]) {
          acumuladoClientes[nombre] = 0;
        }
        acumuladoClientes[nombre] += total;
      }
    }
  });

  const resultado = Object.entries(acumuladoClientes).map(([cliente, total]) => ({
    cliente,
    total: Math.round(total * 100) / 100
  }));

  resultado.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    return a.cliente.localeCompare(b.cliente);
  });

  return resultado.slice(0, n);
}