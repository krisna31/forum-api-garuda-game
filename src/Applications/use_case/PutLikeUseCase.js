class PutLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId);
    await this._commentRepository.verifyAvailableCommentInThread(useCasePayload.commentId, useCasePayload.threadId);
    const isLiked = await this._likeRepository.verifyLikeExist(useCasePayload.commentId, useCasePayload.owner);
    isLiked
      ? await this._likeRepository.deleteLike(useCasePayload.commentId, useCasePayload.owner)
      : await this._likeRepository.storeLike(useCasePayload.commentId, useCasePayload.owner);
  }
}

module.exports = PutLikeUseCase;
