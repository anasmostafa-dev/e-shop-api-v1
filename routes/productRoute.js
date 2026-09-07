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
  .get(getAllproducts)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadImagesProduct,
    resizeImageProduct,
    createProductValidator,
    createProduct,
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadImagesProduct,
    resizeImageProduct,
    updateProductValidator,
    updateProduct,
  )
  .delete(protect, allowedTo("admin"), deleteProductValidator, deleteProduct);

module.exports = router;
