const mongoose = require("mongoose");
const productModel = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, "Minimum raing greater than 1.0"],
      max: [5, "Maximum raing less than 5.0"],
      required: [true, "Rating review is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Review must belong to user"],
    },
    // Parent Reference
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: [true, "Review must belong to product"],
    },
  },
  { timestamps: true },
);

reviewSchema.pre(/^find/, function () {
  this.populate({ path: "user", select: "name" });
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId,
) {
  const result = await this.aggregate([
    // stage 1: get all reviews in specific product
    { $match: { product: productId } },

    // stage 2:
    {
      $group: {
        _id: "product",
        avgRatings: { $avg: "$rating" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  // console.log(result);
  if (result.length > 0) {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAvg: result[0].avgRatings,
      ratingsQty: result[0].ratingsQuantity,
    });
  } else {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAvg: 0,
      ratingsQty: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.constructor.calcAverageRatingsAndQuantity(this.product);
  },
);

module.exports = mongoose.model("Review", reviewSchema);
