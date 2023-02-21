const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const GetThreadUseCase = require("../GetThreadByIdUseCase");
const ReplyRepository = require("../../../Domains/replies/RepliesRepository");

describe("GetThreadUseCase", () => {
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const expectedComments = [
      {
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        username: "31",
        date: "2023",
        content: "ini isi komentar",
        is_deleted: false,
      },
    ];

    const expectedReplies = [
      {
        id: "reply-123",
        content: "ini isi balasan",
        date: "2023",
        username: "krisna",
        owner: "user-123",
        comment_id: "comment-123",
        is_deleted: false,
      },
    ];

    const mappedComments = expectedComments.map((
      { is_deleted: deletedComment, threadId, owner, ...rest }
      ) => rest)[0];
    const mappedReplies = expectedReplies.map((
      { owner, comment_id, is_deleted, ...rest }
      ) => rest);

    const expectedCommentsAndReplies = [
      {
        ...mappedComments,
        replies: mappedReplies,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => 
    Promise.resolve({
      id: "thread-123",
      title: "ini judul thread",
      body: "ini isi thread",
      date: "2023",
      username: "31",
    }));
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => 
    Promise.resolve([
      {
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        username: "31",
        date: "2023",
        content: "ini isi komentar",
        is_deleted: false,
      },
    ]));
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockImplementation(() => 
    Promise.resolve([
      {
        id: "reply-123",
        content: "ini isi balasan",
        date: "2023",
        username: "krisna",
        owner: "user-123",
        comment_id: "comment-123",
        is_deleted: false,
      },
    ]));

    const mockGetThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      repliesRepository: mockReplyRepository,
    });

    // Action
    const theThread = await mockGetThreadUseCase.execute(useCasePayload.threadId);

    // Assert
    expect(theThread).toStrictEqual({
      id: "thread-123",
      title: "ini judul thread",
      body: "ini isi thread",
      date: "2023",
      username: "31",
      comments: expectedCommentsAndReplies,
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload.threadId);
  });

  it("should not display deleted comment", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const expectedComments = [
      {
        id: "comment-123",
        username: "31",
        date: "2023",
        content: "**komentar telah dihapus**",
        is_deleted: true,
      },
    ];

    const expectedReplies = [
      {
        id: "reply-123",
        content: "**balasan telah dihapus**",
        date: "2023",
        username: "krisna",
        comment_id: "comment-123",
        is_deleted: true,
      },
    ];

    const mappedComments = expectedComments.map(({ is_deleted: deletedComment, ...rest }) => rest)[0];
    const mappedReplies = expectedReplies.map(({ comment_id, is_deleted, ...rest }) => rest);

    const expectedCommentsAndReplies = [
      {
        ...mappedComments,
        replies: mappedReplies,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve({
        id: "thread-123",
        title: "ini judul thread",
        body: "ini isi thread",
        date: "2023",
        username: "31",
      }));
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve([
      {
      id: "comment-123",
      username: "31",
      date: "2023",
      content: "**komentar telah dihapus**",
      is_deleted: true,
    },
  ]));
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockImplementation(() => Promise.resolve([
      {
        id: "reply-123",
        content: "**balasan telah dihapus**",
        date: "2023",
        username: "krisna",
        comment_id: "comment-123",
        is_deleted: true,
      },
    ]));

    const mockGetThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      repliesRepository: mockReplyRepository,
    });

    // Action
    const theThread = await mockGetThreadUseCase.execute(useCasePayload.threadId);

    // Assert
    expect(theThread).toStrictEqual({
      id: "thread-123",
      title: "ini judul thread",
      body: "ini isi thread",
      date: "2023",
      username: "31",
      comments: expectedCommentsAndReplies,
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload.threadId);
  });
});
