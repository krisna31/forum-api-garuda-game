class getThreadByIdUseCase {
  constructor({
    commentRepository, threadRepository, repliesRepository, likesRepository,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._repliesRepository = repliesRepository;
    this._likesRepository = likesRepository;
  }

  async execute(threadId) {
    let comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const replies = await this._repliesRepository.getRepliesByThreadId(threadId);

    comments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
      replies: replies
        .filter((reply) => reply.comment_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
          date: reply.date,
          username: reply.username,
        })),
    }));

    comments = await this._addLikeCountToComment(comments);

    return {
      ...thread,
      comments,
    };
  }

  async _addLikeCountToComment(comments) {
    for (const comment of comments) {
      comment.likeCount = await this._likesRepository.getLikeCount(comment.id);
    }
    return comments;
  }
}

module.exports = getThreadByIdUseCase;
