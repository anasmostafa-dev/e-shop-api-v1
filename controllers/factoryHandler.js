const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (model) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await model.findById(id);
    if (!document) {
      return next(new ApiError(`No document for this id: ${id}`, 404));
    }

    // Trigger "deleteOne" event when delete document
    await document.deleteOne();

    res.status(204).send();
  });
};

exports.updateOne = (model) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await model.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!document) {
      return next(new ApiError(`No document for this id: ${id}`, 404));
    }

    // Trigger "save" event when update document
    document.save();

    res.status(200).json({ data: document });
  });
};

exports.createOne = (model) => {
  return asyncHandler(async (req, res) => {
    const newDoc = await model.create(req.body);
    res.status(201).json({ data: newDoc });
  });
};

exports.getOne = (model, populateOpt) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    let filter = { _id: id };
    if (req.filterObj) {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      filter = { ...filter, ...req.filterObj };
    }

    // 1- build query
    let query = model.findOne(filter);
    if (populateOpt) {
      query = query.populate(populateOpt);
    }

    // 2- execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id: ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });
};

exports.getAll = (model, modelName = "") => {
  return asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) filter = req.filterObj;
    // Build Query
    const documentsCounts = await model.countDocuments(filter);
    const apiFeatures = new ApiFeatures(model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .limitFields()
      .search(modelName)
      .sort();

    // Excute Query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ result: documents.length, paginationResult, data: documents });
  });
};

exports.changeQuery = (model, fieldName = "") => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await model.findByIdAndUpdate(
      id,
      { [fieldName]: req.body[fieldName] },
      {
        new: true,
      },
    );
    if (!document) {
      return next(new ApiError(`No found document for this id: ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });
};
