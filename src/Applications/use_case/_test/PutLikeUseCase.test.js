const PutLikeUseCase = require('../PutLikeUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeRepository = require('../../../Domains/likes/LikesRepository');

describe('PutLikeUseCase', () => {
  it('should orchestrating the add like action correctly if not liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      owner: 'user-123',
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockLikeRepository.verifyLikeExist = jest.fn().mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.storeLike = jest.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const putLikeUseCase = new PutLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await putLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableCommentInThread).toBeCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockLikeRepository.verifyLikeExist).toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockLikeRepository.storeLike).toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
  });

  it('should orchestrating the delete like action correctly if liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockLikeRepository.verifyLikeExist = jest.fn().mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = jest.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const putLikeUseCase = new PutLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await putLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableCommentInThread).toBeCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockLikeRepository.verifyLikeExist)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockLikeRepository.deleteLike)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
  });
});
