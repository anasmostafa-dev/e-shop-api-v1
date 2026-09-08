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
router.get(
  "/getMe",
  getLoggedUserData,
  /* #swagger.tags = ['Users'] */ getUser,
);
router.put(
  "/updateMyPassword",
  updateLoggedUserPasswordValidator,
  /* #swagger.tags = ['Users'] */ updateMyPassword,
);
router.put(
  "/updateMe",
  updateLoggedUserValidator,
  /* #swagger.tags = ['Users'] */ updateLoggedUserData,
);
router.put(
  "/deactivateMe",
  /* #swagger.tags = ['Users'] */ deactivateLoggedUserData,
);

// Admin
router.put(
  "/changepassword/:id",
  allowedTo("admin"),
  changePasswordValidator,
  /* #swagger.tags = ['Users'] */ changeUserPassword,
);

router.put(
  "/changeStatus/:id",
  allowedTo("admin"),
  updateQueryValidator,
  /* #swagger.tags = ['Users'] */ updateField,
);

router
  .route("/")
  .get(
    allowedTo("admin", "manager"),
    /* #swagger.tags = ['Users'] */ getAllUsers,
  )
  .post(
    protect,
    allowedTo("admin"),
    uploadeUserImg,
    resizeImageUser,
    createUserValidator,
    /* #swagger.tags = ['Users'] */ createUser,
  );

router
  .route("/:id")
  .get(
    allowedTo("admin"),
    getUserValidator,
    /* #swagger.tags = ['Users'] */ getUser,
  )
  .put(
    allowedTo("admin"),
    uploadeUserImg,
    resizeImageUser,
    updateUserValidator,
    /* #swagger.tags = ['Users'] */ updateUser,
  )
  .delete(
    allowedTo("admin"),
    deleteUserValidator,
    /* #swagger.tags = ['Users'] */ deleteUser,
  );

module.exports = router;
