const User = require("../models/users");
const { encryptPassword } = require("../utils/password");

// Read o Leer
const getUsers = async () => {
  return await User.findAll({
    attributes: {
      exclude: ["password"],
    },
  });
};

const getUserById = async (id) => {
  return await User.findByPk(id, {
    attributes: {
      exclude: ["password"],
    },
  });
};

//Create o Crear
const createUser = async (data) => {
  const password = await encryptPassword(data.password);

  return await User.create({
    name: data.name,
    email: data.email,
    password,
  });
};

//Update o actualizar
const updateUser = async (id, data) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("User not found");
  }

  if (data.password) {
    data.password = await encryptPassword(data.password);
  }

  await user.update(data);

  return user;
};

//Delete o Eliminar
const deleteUser = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("User not found");
  }

  await user.destroy();

  return {
    message: "User deleted",
  };
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
