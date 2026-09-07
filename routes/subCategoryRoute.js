const express = require("express");

const {
  createSubCategory,
  getSubCategory,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory,
  setCategoryidToBody,
  createFilterObject,
} = require("../controllers/subCategoryController");

const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validators/subCategoryValidators");
const { protect, allowedTo } = require("../controllers/authController");

// mergeParams:=>   Allow us to access parameters on other router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    protect,
    allowedTo("admin", "manager"),
    setCategoryidToBody,
    createSubCategoryValidator,
    createSubCategory,
  )
  .get(createFilterObject, getAllSubCategories);
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory,
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory,
  );

module.exports = router;
