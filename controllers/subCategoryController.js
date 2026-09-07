const SubCategoryModel = require("../models/subCategoryModel");
const factory = require("./factoryHandler");

// @desc   : MW for getAllSubCategories
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;

  next();
};

// @route  : POST /api/v1/categories/:categoryId/subcategory
// @desc   : MW for createSubCategory --> Nested Route
// @access : Private
exports.setCategoryidToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// @route  : GET /api/v1/subcategories/
// @desc   : Get all subCategories
// @access : Public
exports.getAllSubCategories = factory.getAll(SubCategoryModel);

// @route  : GET /api/v1/subcategories/:id
// @desc   : Get Specific subCategory
// @access : public
exports.getSubCategory = factory.getOne(SubCategoryModel);

// @route  : POST /api/v1/subcategories/
// @desc   : Create subCategory
// @access : Private
exports.createSubCategory = factory.createOne(SubCategoryModel);

// @route  : PUT /api/v1/subcategories/:id
// @desc   : Update specific subCategory
// @access : Private
exports.updateSubCategory = factory.updateOne(SubCategoryModel);

// @route  : DELETE /api/v1/subcategories/:id
// @desc   : Delete specific subCategory
// @access : Private
exports.deleteSubCategory = factory.deleteOne(SubCategoryModel);
