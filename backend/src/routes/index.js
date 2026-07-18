const router = require("express").Router();

const userRoutes = require("./user/");

router.use("/user", userRoutes);

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running",
  });
});

module.exports = router;
