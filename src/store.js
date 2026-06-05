'use strict';

/**
 * Capa de datos (persistencia simple en archivo JSON).
 * Aísla la lectura/escritura para poder migrar a Postgres/Airtable
 * cambiando solo este archivo.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const COLECCIONES = ['pedidos', 'citas', 'urgencias', 'leads'];

function vacio() {
  return COLECCIONES.reduce((acc, c) => ((acc[c] = []), acc), {});
}

function asegurarArchivo() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(vacio(), null, 2));
}

function leerTodo() {
  asegurarArchivo();
  try {
    return { ...vacio(), ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) };
  } catch {
    return vacio();
  }
}

function agregar(coleccion, item) {
  if (!COLECCIONES.includes(coleccion)) {
    throw new Error(`Colección desconocida: ${coleccion}`);
  }
  const db = leerTodo();
  db[coleccion].unshift(item);
  asegurarArchivo();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  return item;
}

module.exports = { leerTodo, agregar, COLECCIONES };
