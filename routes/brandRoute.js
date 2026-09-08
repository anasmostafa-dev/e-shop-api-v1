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
  .get(/* #swagger.tags = ['Brands'] */ getAllBrands)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadeBrandImg,
    resizeImageBrand,
    createBrandValidator,
    /* #swagger.tags = ['Brands'] */ createBrand,
  );
router
  .route("/:id")
  .get(getBrandValidator, /* #swagger.tags = ['Brands'] */ getBrand)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadeBrandImg,
    resizeImageBrand,
    updateBrandValidator,
    /* #swagger.tags = ['Brands'] */ updateBrand,
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteBrandValidator,
    /* #swagger.tags = ['Brands'] */ deleteBrand,
  );

module.exports = router;
