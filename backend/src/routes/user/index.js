const router = require("express").Router();

const controller = require("../../controllers/index");

router.get("/", controller.getUsers);

router.get("/:id", controller.getUserById);

router.post("/", controller.createUser);

router.put("/:id", controller.updateUser);

router.delete("/:id", controller.deleteUser);

module.exports = router;
