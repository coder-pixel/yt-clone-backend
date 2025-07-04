export class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong!",
    errors = [],
    stack = ""
  ) {
    super(message); // super is used to call the constructor of the parent class
    this.statusCode = Number(statusCode); // status code is set to the status code passed in the constructor
    this.data = null; // data is set to null, because we don't need to send any data to the client
    this.message = message;
    this.success = false;
    this.errors = errors;

    // if stack is passed, then set the stack to the stack passed in the constructor,
    // otherwise capture the stack trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
