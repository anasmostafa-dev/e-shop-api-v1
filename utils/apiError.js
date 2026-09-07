//@desc    this class is responsible about operational errors(errors that i can predect)

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
    //يعني الخطأ دا انا متنبأ بيه
    this.isOperational = true;
  }
}

module.exports = ApiError;
