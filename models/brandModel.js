const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Brand name is too short"],
      maxlength: [32, "Brand name is too long"],
    },

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
    const imageURL = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageURL;
  }
};

// for getOne, getAll, update
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});

// for create, save
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model("brand", brandSchema);
