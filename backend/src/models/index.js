const sequelize = require("../config/database");

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
