const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ─── Configuración del SDK de Cloudinary ──────────────────────
// Inicializa Cloudinary con las credenciales provistas
cloudinary.config({
  cloud_name: "ditggsmd",
  api_key: "878829813274737",
  api_secret: "yO3x3WrCQ7MwDgLMgz5-aAemoYs",
});

// ─── Storage para imágenes (portadas de libros) ──────────────
// Guarda las imágenes en la carpeta 'bibliotech/portadas'
const portadaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bibliotech/portadas",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 800, height: 1200, crop: "limit" }],
  },
});

// ─── Storage para archivos PDF (libros digitales) ────────────
// Los PDF se suben como 'raw' para que Cloudinary no los rechace
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "bibliotech/pdfs",
    resource_type: "raw", // 👈 Necesario para PDFs y documentos binarios
    format: "pdf",
  }),
});

// ─── Filtros de archivos ─────────────────────────────────────
// Filtra solo imágenes (jpg, png, jpeg)
const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(
    new Error("Formato de imagen no permitido. Use JPG, PNG o JPEG"),
    false
  );
};

// Filtra solo PDFs
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    return cb(null, true);
  }
  return cb(new Error("Formato no permitido. Use PDF"), false);
};

// ─── Instancias de Multer ────────────────────────────────────
// Multer para subir una sola imagen (portada)
const uploadPortada = multer({
  storage: portadaStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

// Multer para subir un solo PDF
const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo
});

// ─── Middleware combinado para subir ambos archivos ──────────
// Acepta campos múltiples: 'foto' (portada) y 'pdf' (documento)
// Se usa multer con memoryStorage para procesar ambos en la misma petición
// y luego subirlos manualmente a Cloudinary con sus respectivas configs
const uploadBookFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: "foto", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);

// ─── Función auxiliar para subir buffer a Cloudinary ──────────
// Sube una imagen desde memoria a la carpeta de portadas
const uploadImageFromBuffer = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "bibliotech/portadas",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ width: 800, height: 1200, crop: "limit" }],
        public_id: originalName
          ? originalName.split(".")[0] + "-" + Date.now()
          : `portada-${Date.now()}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// Sube un PDF desde memoria a la carpeta de PDFs como 'raw'
const uploadPdfFromBuffer = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "bibliotech/pdfs",
        resource_type: "raw", // 👈 Necesario para PDFs
        format: "pdf",
        public_id: originalName
          ? originalName.split(".")[0] + "-" + Date.now()
          : `libro-${Date.now()}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadPortada,
  uploadPdf,
  uploadBookFiles,
  uploadImageFromBuffer,
  uploadPdfFromBuffer,
};
