/* eslint-disable linebreak-style */
const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const GetThreadByIdUseCase = require("../../../../Applications/use_case/GetThreadByIdUseCase");

class ThreadHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler({ payload, auth }, h) {
    const usecasePayload = {
      title: payload.title,
      body: payload.body,
      owner: auth.credentials.id,
    };

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(usecasePayload);

    const response = h.response({
      status: "success",
      message: "Thread berhasil ditambahkan",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadHandler;
