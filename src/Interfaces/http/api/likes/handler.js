const PutLikeUseCase = require('../../../../Applications/use_case/PutLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const putLikeUseCase = this._container.getInstance(PutLikeUseCase.name);
    await putLikeUseCase.execute({
      owner: userId, threadId, commentId,
    });

    const response = h.response({ status: 'success' });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
