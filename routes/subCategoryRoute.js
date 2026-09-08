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
    /* #swagger.tags = ['SubCategories'] */ createSubCategory,
  )
  .get(
    createFilterObject,
    /* #swagger.tags = ['SubCategories'] */ getAllSubCategories,
  );
router
  .route("/:id")
  .get(
    getSubCategoryValidator,
    /* #swagger.tags = ['SubCategories'] */ getSubCategory,
  )
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    /* #swagger.tags = ['SubCategories'] */ updateSubCategory,
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteSubCategoryValidator,
    /* #swagger.tags = ['SubCategories'] */ deleteSubCategory,
  );

module.exports = router;
