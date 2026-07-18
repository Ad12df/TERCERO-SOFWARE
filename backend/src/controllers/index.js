const service = require("../services/users");

exports.getUsers = async (req, res) => {
  try {
    const users = await service.getUsers();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await service.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await service.createUser(req.body);

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await service.updateUser(req.params.id, req.body);

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await service.deleteUser(req.params.id);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
