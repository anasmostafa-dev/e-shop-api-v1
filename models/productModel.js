const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [2, "product name is too short"],
      maxlength: [100, "product name is too long"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    desc: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [20, "Product description is too short"],
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      max: [9999999999, "Product price is too long"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],
    coverImage: {
      type: String,
      required: true,
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    subcategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "brand",
    },
    ratingsAvg: {
      type: Number,
      default: 0,
      min: [1, "Rating average must be above or equal 1"],
      max: [5, "Rating average must be below or equal 5"],
    },
    ratingsQty: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

productSchema.pre(/^find/, function () {
  this.populate({
    path: "category",
    select: "name -_id",
  });
});

const setImageURL = (doc) => {
  if (doc.coverImage && !doc.coverImage.startsWith("http")) {
    const imageURL = `${process.env.BASE_URL}/products/${doc.coverImage}`;
    doc.coverImage = imageURL;
  }
  if (doc.images && Array.isArray(doc.images)) {
    const imagesList = [];
    doc.images.forEach((image) => {
      if (image && !image.startsWith("http")) {
        imagesList.push(`${process.env.BASE_URL}/products/${image}`);
      } else {
        imagesList.push(image);
      }
    });
    doc.images = imagesList;
  }
};

// for getOne, getAll, update
productSchema.post("init", (doc) => {
  setImageURL(doc);
});

// for create, save
productSchema.post("save", (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model("Product", productSchema);
