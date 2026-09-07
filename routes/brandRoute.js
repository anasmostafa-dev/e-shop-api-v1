const express = require("express");

const {
  getAllBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadeBrandImg,
  resizeImageBrand,
} = require("../controllers/brandController");
const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidators");

const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(getAllBrands)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadeBrandImg,
    resizeImageBrand,
    createBrandValidator,
    createBrand,
  );
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadeBrandImg,
    resizeImageBrand,
    updateBrandValidator,
    updateBrand,
  )
  .delete(protect, allowedTo("admin"), deleteBrandValidator, deleteBrand);

module.exports = router;
