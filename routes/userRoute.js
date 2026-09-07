const express = require("express");

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  uploadeUserImg,
  resizeImageUser,
  updateField,
  changeUserPassword,
  getLoggedUserData,
  updateMyPassword,
  updateLoggedUserData,
  deactivateLoggedUserData,
} = require("../controllers/userController");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateQueryValidator,
  changePasswordValidator,
  updateLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidators");
const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

// Logged user
router.get("/getMe", getLoggedUserData, getUser);
router.put(
  "/updateMyPassword",
  updateLoggedUserPasswordValidator,
  updateMyPassword,
);
router.put("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
router.put("/deactivateMe", deactivateLoggedUserData);

// Admin
router.put(
  "/changepassword/:id",
  allowedTo("admin"),
  changePasswordValidator,
  changeUserPassword,
);

router.put(
  "/changeStatus/:id",
  allowedTo("admin"),
  updateQueryValidator,
  updateField,
);

router
  .route("/")
  .get(allowedTo("admin", "manager"), getAllUsers)
  .post(
    protect,
    allowedTo("admin"),
    uploadeUserImg,
    resizeImageUser,
    createUserValidator,
    createUser,
  );

router
  .route("/:id")
  .get(allowedTo("admin"), getUserValidator, getUser)
  .put(
    allowedTo("admin"),
    uploadeUserImg,
    resizeImageUser,
    updateUserValidator,
    updateUser,
  )
  .delete(allowedTo("admin"), deleteUserValidator, deleteUser);

module.exports = router;
