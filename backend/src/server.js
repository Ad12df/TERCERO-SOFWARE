require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./models");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // ─── Conectar a la base de datos primero ─────────────────
    await connectDB();

    // ─── Solo si la conexión es exitosa, iniciar el servidor ──
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 API disponible en: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ No se pudo iniciar el servidor:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
