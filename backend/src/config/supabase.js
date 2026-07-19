const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");

// ─── Configuración del SDK de Supabase ───────────────────────
// Inicializa el cliente de Supabase con las credenciales del proyecto.
// Se usa la SERVICE ROLE KEY para operaciones administrativas en Storage
// (subida y descarga de archivos) sin depender de políticas RLS del usuario.
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://fzxtkzqkpknsjhitnszd.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eHRrenFrcGtuc2poaXRuc3pkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkwNDAwMCwiZXhwIjoyMDY4NDc4NDAwfQ.hbLXNDz664H5oT9ZhOuMfd-4wp_nH304xCSdjTblGQY";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── Nombres de buckets ──────────────────────────────────────
const BUCKET_PORTADAS = "portadas";
const BUCKET_PDFS = "pdfs";

// ─── Middleware de Multer (memoryStorage) ────────────────────
// Acepta los campos 'foto' (portada) y 'pdf' (documento) en una sola petición.
// Los archivos se mantienen en memoria (buffer) y se suben manualmente a
// Supabase Storage desde el controlador.
const uploadBookFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo por archivo
}).fields([
  { name: "foto", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);

// ─── Helpers de subida a Supabase Storage ────────────────────
// Genera un nombre de archivo ÚNICO, PLANO y SEGURO para Supabase Storage.
//
// ⚠️ CRÍTICO — Evita el error 400/500 "Invalid path specified in request URL":
//   - En Windows, `req.files[].originalname` puede llegar con la ruta COMPLETA
//     del archivo (ej. "C:\Users\javi\Documents\libro.pdf") incluyendo
//     backslashes y forward slashes.
//   - Supabase Storage interpreta CUALQUIER slash/backslash como separador
//     de "carpeta" dentro del bucket. Si el path contiene "C:\" el servidor
//     rechaza la petición con "Invalid path specified".
//   - Además, caracteres especiales (acentos, espacios, símbolos) pueden
//     romper la URL pública generada.
//
// SOLUCIÓN: extraer SOLO el nombre del archivo, eliminar todo carácter no
// seguro y devolver un nombre plano tipo "1721423456-libro.pdf".
function buildUniqueName(originalName) {
  // 1. Extraer solo el nombre del archivo (sin ruta de Windows/Unix)
  let base = originalName || "file";
  base = base.split(/[\\/]/).pop(); // quita "C:\Users\...\"

  // 2. Separar nombre y extensión (solo la última extensión)
  const lastDot = base.lastIndexOf(".");
  let namePart = lastDot !== -1 ? base.substring(0, lastDot) : base;
  let extPart = lastDot !== -1 ? base.substring(lastDot + 1) : "";

  // 3. Sanitizar agresivamente: SOLO alfanuméricos, guiones y guiones bajos.
  //    Se eliminan espacios, acentos, símbolos y cualquier carácter raro.
  namePart = namePart.replace(/[^a-zA-Z0-9._-]/g, "");
  extPart = extPart.replace(/[^a-zA-Z0-9._-]/g, "");

  // 4. Si quedó vacío, usar un nombre genérico
  if (!namePart) namePart = "archivo";
  if (!extPart) extPart = "bin";

  // 5. Ensamblar nombre único con timestamp (ej: "1721423456-libro.pdf")
  const stamp = Date.now();
  const finalName = `${stamp}-${namePart}.${extPart}`;

  // 6. Última red de seguridad: garantizar que NO contenga slashes ni
  //    empiece con "/" o "\". Si por algún motivo se colara, se elimina.
  return finalName.replace(/[\\/]/g, "").replace(/^\.+/, "");
}

// Sube una imagen de portada al bucket 'portadas' desde un buffer.
// Devuelve la URL pública del archivo subido.
//
// ⚠️ SDK Supabase JS v2: `getPublicUrl()` devuelve
//    { data: { publicUrl } }  (con 'u' minúscula).
//    La API antigua `publicURL` (mayúscula) ya NO existe y devuelve undefined.
async function uploadImageFromBuffer(buffer, originalName) {
  const fileName = buildUniqueName(originalName);

  const { error } = await supabase.storage
    .from(BUCKET_PORTADAS)
    .upload(fileName, buffer, {
      contentType: "image/*",
      upsert: false,
    });

  if (error) throw error;

  // ✅ API correcta en Supabase JS v2
  const { data } = supabase.storage
    .from(BUCKET_PORTADAS)
    .getPublicUrl(fileName);

  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    throw new Error("No se pudo obtener la URL pública de la portada.");
  }

  return { secure_url: publicUrl, public_id: fileName };
}

// Sube un PDF al bucket 'pdfs' desde un buffer.
// Devuelve la URL pública del archivo subido.
async function uploadPdfFromBuffer(buffer, originalName) {
  const fileName = buildUniqueName(originalName);

  const { error } = await supabase.storage
    .from(BUCKET_PDFS)
    .upload(fileName, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) throw error;

  // ✅ API correcta en Supabase JS v2
  const { data } = supabase.storage
    .from(BUCKET_PDFS)
    .getPublicUrl(fileName);

  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    throw new Error("No se pudo obtener la URL pública del PDF.");
  }

  return { secure_url: publicUrl, public_id: fileName };
}

module.exports = {
  supabase,
  BUCKET_PORTADAS,
  BUCKET_PDFS,
  uploadBookFiles,
  uploadImageFromBuffer,
  uploadPdfFromBuffer,
};
