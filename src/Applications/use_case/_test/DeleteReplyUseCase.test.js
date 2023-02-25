const RepliesRepository = require("../../../Domains/replies/RepliesRepository");
const DeleteReplyUseCase = require("../DeleteReplyUseCase");

describe("DeleteReplyUseCase", () => {
  it("should orchestrating the delete reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      replyId: "reply-123",
      commentId: "comment-123",
      threadId: "thread-123",
      owner: "user-123",
    };

    const mockRepliesRepository = new RepliesRepository();

    // mock dependency
    mockRepliesRepository.verifyAvailableReply = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockRepliesRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve(1));
    mockRepliesRepository.deleteReplyById = jest.fn().mockImplementation(() => Promise.resolve(1));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockRepliesRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockRepliesRepository.verifyAvailableReply).toBeCalledWith(useCasePayload.threadId, useCasePayload.commentId, useCasePayload.replyId);
    expect(mockRepliesRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.replyId, useCasePayload.owner);
    expect(mockRepliesRepository.deleteReplyById).toBeCalledWith(useCasePayload.replyId);
  });
});
