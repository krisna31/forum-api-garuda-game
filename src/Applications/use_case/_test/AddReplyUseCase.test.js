const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const RepliesRepository = require("../../../Domains/replies/RepliesRepository");
const AddReplyUseCase = require("../AddReplyUseCase");

describe("AddReplyUseCase", () => {
  it("should orchestrate the add reply use case properly", async () => {
    // arrange
    const useCasePayload = {
      commentId: "comment-123",
      threadId: "thread-123",
      content: "reply content",
      owner: "user-123",
    };

    const expectedAddedReply = new AddedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockRepliesRepository.addReply = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new AddedReply({
          id: "reply-123",
          content: useCasePayload.content,
          owner: useCasePayload.owner,
        })
      )
    );

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockRepliesRepository,
    });

    // action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableCommentInThread).toBeCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockRepliesRepository.addReply).toBeCalledWith(new NewReply(useCasePayload));
  });
});
