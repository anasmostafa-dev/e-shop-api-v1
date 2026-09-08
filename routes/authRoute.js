const express = require("express");
const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");
const {
  signup,
  login,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signupValidator, /* #swagger.tags = ['Auth'] */ signup);
router.post("/login", loginValidator, /* #swagger.tags = ['Auth'] */ login);
router.post("/forgotPassword", /* #swagger.tags = ['Auth'] */ forgotPassword);
router.post(
  "/verifyResetCode",
  /* #swagger.tags = ['Auth'] */ verifyPasswordResetCode,
);
router.put("/resetPassword", /* #swagger.tags = ['Auth'] */ resetPassword);

module.exports = router;
