const express = require("express");

const {
  createProduct,
  getAllproducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImagesProduct,
  resizeImageProduct,
} = require("../controllers/productController");

const subCategoryRoute = require("./subCategoryRoute");

const {
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
  createProductValidator,
} = require("../utils/validators/productValidator");
const { protect, allowedTo } = require("../controllers/authController");
const reviewRoute = require("./reviewRoute");

const router = express.Router();

router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .get(/* #swagger.tags = ['Products'] */ getAllproducts)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadImagesProduct,
    resizeImageProduct,
    createProductValidator,
    /* #swagger.tags = ['Products'] */ createProduct,
  );
router
  .route("/:id")
  .get(getProductValidator, /* #swagger.tags = ['Products'] */ getProduct)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadImagesProduct,
    resizeImageProduct,
    updateProductValidator,
    /* #swagger.tags = ['Products'] */ updateProduct,
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteProductValidator,
    /* #swagger.tags = ['Products'] */ deleteProduct,
  );

module.exports = router;
