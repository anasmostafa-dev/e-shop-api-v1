const express = require("express");

const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadeCategoryImg,
  resizeImageCategory,
} = require("../controllers/categoryController");

const subCategoryRoute = require("./subCategoryRoute");

const {
  getCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  createCategoryValidator,
} = require("../utils/validators/categoryValidators");
const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router.use("/:categoryId/subcategories", subCategoryRoute);

router
  .route("/")
  .get(/* #swagger.tags = ['Categories'] */ getAllCategories)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadeCategoryImg,
    resizeImageCategory,
    createCategoryValidator,
    /* #swagger.tags = ['Categories'] */ createCategory,
  );
router
  .route("/:id")
  .get(getCategoryValidator, /* #swagger.tags = ['Categories'] */ getCategory)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadeCategoryImg,
    resizeImageCategory,
    updateCategoryValidator,
    /* #swagger.tags = ['Categories'] */ updateCategory,
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteCategoryValidator,
    /* #swagger.tags = ['Categories'] */ deleteCategory,
  );

module.exports = router;
