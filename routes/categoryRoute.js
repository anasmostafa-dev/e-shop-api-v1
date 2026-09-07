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
  .get(getAllCategories)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadeCategoryImg,
    resizeImageCategory,
    createCategoryValidator,
    createCategory,
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadeCategoryImg,
    resizeImageCategory,
    updateCategoryValidator,
    updateCategory,
  )
  .delete(protect, allowedTo("admin"), deleteCategoryValidator, deleteCategory);

module.exports = router;
