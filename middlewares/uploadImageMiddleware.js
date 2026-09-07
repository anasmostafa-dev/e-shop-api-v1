const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
  // memort storage engine
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};
exports.uploadSingleImg = (fieldName) => {
  return multerOptions().single(fieldName);
};

exports.uploadMultiImages = (arrOfFields) => {
  return multerOptions().fields(arrOfFields);
};
