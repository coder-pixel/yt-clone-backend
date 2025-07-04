export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode; // status code is used to set the status code of the response
    this.data = data; // data is the data that is sent to the client
    this.message = message; // message is the message that is sent to the client
    this.success = true; // success is a boolean that is used to set the success of the response
  }

  send(res) {
    res.status(this.statusCode).json({});
  }
}
