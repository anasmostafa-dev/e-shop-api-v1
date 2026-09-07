const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Category name is too short"],
      maxlength: [32, "Category name is too long"],
    },

    //if category is: catA and catB become => shopping.com/catA-and-catB
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  {
    timestamps: true,
  },
);

const setImageURL = (doc) => {
  if (doc.image && !doc.image.startsWith("http")) {
    const imageURL = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageURL;
  }
};

// for getOne, getAll, update
categorySchema.post("init", (doc) => {
  setImageURL(doc);
});

// for create, save
categorySchema.post("save", (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model("Category", categorySchema);
