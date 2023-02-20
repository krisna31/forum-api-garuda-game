const pool = require("../../database/postgres/pool");
const RepliesRepository = require("../../../Domains/replies/RepliesRepository");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const CommentsTableTestHelper = require("../../../../tests/CommentTestTableHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ReplyRepositoryPostgres", () => {
  it("should be instance of ReplyRepository domain", () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {});

    expect(replyRepositoryPostgres).toBeInstanceOf(RepliesRepository);
  });

  describe("behavior test", () => {
    beforeAll(async () => {
      await UsersTableTestHelper.addUser({ id: "user-123", username: "krisna" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
    });

    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await pool.end();
    });

    describe("addReply function", () => {
      it("addReply function should add database entry for said reply", async () => {
        // Arrange
        const newReply = new NewReply({
          commentId: "comment-123",
          content: "some content",
          owner: "user-123",
        });
        const fakeIdGenerator = () => "123";
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

        // action
        const addedReply = await replyRepositoryPostgres.addReply(newReply);
        const replies = await RepliesTableTestHelper.getReplyById("reply-123");

        // assert
        expect(addedReply).toStrictEqual(
          new AddedReply({
            id: "reply-123",
            content: "some content",
            owner: "user-123",
          })
        );
        expect(replies).toHaveLength(1);
      });
    });

    describe("verifyAvailableReply function", () => {
      it("should throw NotFoundError when reply is not available", async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // action & assert
        await expect(replyRepositoryPostgres.verifyAvailableReply("thread-123", "comment-123", "reply-123")).rejects.toThrowError(NotFoundError);
      });

      it("should not throw NotFoundError and rowCOunt return 1 when reply is available", async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: "reply-123",
          commentId: "comment-123",
          owner: "user-123",
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        const rowCount = await replyRepositoryPostgres.verifyAvailableReply("thread-123", "comment-123", "reply-123");

        // assert
        await expect(replyRepositoryPostgres.verifyAvailableReply("thread-123", "comment-123", "reply-123")).resolves.not.toThrowError(NotFoundError);
        expect(rowCount).toEqual(1);
      });
    });

    describe("verifyReplyOwner function", () => {
      it("should throw AuthorizationError when reply is not owner", async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: "reply-123",
          commentId: "comment-123",
          owner: "user-123",
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyReplyOwner("reply-123", "user-321")).rejects.toThrowError(AuthorizationError);
      });

      it("should not throw AuthorizationError when reply owner", async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: "reply-123",
          commentId: "comment-123",
          owner: "user-123",
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        const rowCount = await replyRepositoryPostgres.verifyReplyOwner("reply-123", "user-123");

        // Assert
        await expect(replyRepositoryPostgres.verifyReplyOwner("reply-123", "user-123")).resolves.not.toThrowError(AuthorizationError);
        expect(rowCount).toEqual(1);
      });
    });

    describe("deleteReply function", () => {
      it("should throw NotFoundError when reply is not available", async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.deleteReplyById("reply-123")).rejects.toThrowError(NotFoundError);
      });

      it("should delete reply from database", async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: "reply-123",
          commentId: "comment-123",
          owner: "user-123",
        });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        const rowCount = await replyRepositoryPostgres.deleteReplyById("reply-123");

        // Assert
        const replies = await RepliesTableTestHelper.getReplyById("reply-123");
        expect(replies).toHaveLength(1);
        expect(replies[0].is_deleted).toEqual(true);
        expect(rowCount).toEqual(1);
      });
    });
  });

  describe("getRepliesByThreadId function", () => {
    it("should return replies correctly", async () => {
      // Arrange
      await UserTableTestHelper.addUser({
        username: "dicoding",
        password: "secret_password",
      });
      await ThreadTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123" });
      await RepliesTableTestHelper.addReply({ id: "reply-123", commentId: "comment-123" });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      
      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId("thread-123");

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toStrictEqual({
        id: "reply-123",
        comment_id: "comment-123",
        username: "dicoding",
        date: new Date("2023-08-17T00:00:00.000Z"),
        content: "ini adalah balasan",
        owner: "user-123",
        is_deleted: false,
      });
    });
  });
});
