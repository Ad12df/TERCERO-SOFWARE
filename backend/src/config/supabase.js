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
// Genera un nombre de archivo único conservando la extensión original.
function buildUniqueName(originalName) {
  const ext = originalName ? originalName.split(".").pop() : "";
  const base = originalName
    ? originalName.split(".")[0].replace(/[^a-zA-Z0-9-_]/g, "")
    : "file";
  const stamp = Date.now();
  return ext ? `${base}-${stamp}.${ext}` : `${base}-${stamp}`;
}

// Sube una imagen de portada al bucket 'portadas' desde un buffer.
// Devuelve la URL pública del archivo subido.
async function uploadImageFromBuffer(buffer, originalName) {
  const fileName = buildUniqueName(originalName);
  const { error } = await supabase.storage
    .from(BUCKET_PORTADAS)
    .upload(fileName, buffer, {
      contentType: "image/*",
      upsert: false,
    });

  if (error) throw error;

  const { publicURL } = supabase.storage
    .from(BUCKET_PORTADAS)
    .getPublicUrl(fileName);

  return { secure_url: publicURL, public_id: fileName };
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

  const { publicURL } = supabase.storage
    .from(BUCKET_PDFS)
    .getPublicUrl(fileName);

  return { secure_url: publicURL, public_id: fileName };
}

module.exports = {
  supabase,
  BUCKET_PORTADAS,
  BUCKET_PDFS,
  uploadBookFiles,
  uploadImageFromBuffer,
  uploadPdfFromBuffer,
};
