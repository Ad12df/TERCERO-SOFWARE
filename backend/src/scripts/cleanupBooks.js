/**
 * ==========================================================================
 * SCRIPT DE LIMPIEZA DE LIBROS DE PRUEBA
 * ==========================================================================
 * Uso:  node src/scripts/cleanupBooks.js
 *
 * Este script elimina TODOS los libros de la base de datos.
 * Úsalo para empezar con un catálogo limpio durante las pruebas.
 *
 * ⚠️  ADVERTENCIA: Esto elimina TODOS los registros de la tabla 'books'.
 *     No hay vuelta atrás. Asegúrate de que es lo que quieres.
 *
 * Para eliminar solo ciertos libros, modifica el `where` en Book.destroy({})
 * ==========================================================================
 */

// Cargar configuración de la base de datos ANTES de importar modelos
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const sequelize = require("../config/database");
const { Book, Review } = require("../models");

async function cleanupBooks() {
  console.log("\n🧹  BIBLIOTECH — Script de Limpieza de Libros\n");
  console.log("─────────────────────────────────────────");

  try {
    // ─── 1. Conectar a la base de datos ───────────────────────────────
    console.log("📡  Conectando a la base de datos...");
    await sequelize.authenticate();
    console.log("✅  Conexión exitosa a la base de datos\n");

    // ─── 2. Contar libros antes de eliminar ────────────────────────────
    const countBefore = await Book.count();
    console.log(`📚  Libros encontrados antes de limpiar: ${countBefore}`);

    if (countBefore === 0) {
      console.log("\n✅  La tabla ya está vacía. Nada que hacer.\n");
      process.exit(0);
    }

    // ─── 3. Listar libros que se van a eliminar ───────────────────────
    const booksToDelete = await Book.findAll({
      attributes: ["id", "nombre", "autor"],
      order: [["id", "ASC"]],
    });

    console.log("\n📖  Libros que serán ELIMINADOS:");
    booksToDelete.forEach((book, i) => {
      console.log(`   ${i + 1}. [ID ${book.id}] "${book.nombre}" — ${book.autor}`);
    });

    // ─── 4. Eliminar reviews asociadas primero (por seguridad) ─────────
    const reviewsDeleted = await Review.destroy({
      where: {},
      truncate: true, // Trunca la tabla de reviews
    });
    console.log(`\n🗑️  Reviews eliminadas: ${reviewsDeleted}`);

    // ─── 5. Eliminar todos los libros ─────────────────────────────────
    const deleted = await Book.destroy({
      where: {}, // Vacío = elimina TODOS
      force: true, // Eliminación física (no lógica)
    });

    console.log(`🗑️  Libros eliminados: ${deleted}\n`);

    // ─── 6. Verificar que la tabla quedó vacía ─────────────────────────
    const countAfter = await Book.count();
    console.log(`📚  Libros después de limpiar: ${countAfter}`);

    if (countAfter === 0) {
      console.log("\n✅  Catálogo limpio. La tabla 'books' está vacía.\n");
    } else {
      console.warn("⚠️  Advertencia: aún quedan libros en la tabla.\n");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌  Error durante la limpieza:", error.message);
    if (process.env.NODE_ENV !== "production") {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

cleanupBooks();
