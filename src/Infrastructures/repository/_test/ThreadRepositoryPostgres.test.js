const UserTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const pool = require("../../database/postgres/pool");
const CommentsTableTestHelper = require("../../../../tests/CommentTestTableHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist new thread and return added thread correctly", async () => {
      // Arrange
      await UserTableTestHelper.addUser({
        username: "dicoding",
        password: "secret_password",
      });
      const newThread = new NewThread({
        title: "Dicoding Indonesia",
        body: "Dicoding Indonesia adalah platform belajar pemrograman online terbaik di Indonesia",
        owner: "user-123",
      });

      const fakeIdGenerator = () => "321";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);
      const threads = await ThreadTableTestHelper.findThreadsById("thread-321");

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: "thread-321",
          title: "Dicoding Indonesia",
          owner: "user-123",
        })
      );
      expect(threads).toHaveLength(1);
    });
  });

  describe("getThreadById function", () => {
    it("should throw NotFoundError when thread not found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById("thread-xxx")).rejects.toThrowError(NotFoundError);
    });

    it("should return thread correctly", async () => {
      // Arrange
      await UserTableTestHelper.addUser({
        username: "dicoding",
        password: "secret_password",
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadTableTestHelper.addThread({
        id: "thread-123",
      });

      // Action
      const thread = await threadRepositoryPostgres.getThreadById("thread-123");

      // Assert
      expect(thread).toStrictEqual({
        id: "thread-123",
        title: "Update Honkai",
        body: "Total ukuran update pada tahun 2023 feb kali ini sebesar 2.2.GB",
        date: new Date("2023-08-17T00:00:00.000Z"),
        username: "dicoding",
      });
    });
  });

  describe("verifyAvailableThread function", () => {
    it("should throw NotFoundError when thread not found", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThread("thread-1")).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when thread found and return rowcount must be 1", async () => {
      // Arrange
      await UserTableTestHelper.addUser({
        username: "dicoding",
        password: "secret_password",
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadTableTestHelper.addThread({ id: "thread-123" });

      // Action
      const rowCount = await threadRepositoryPostgres.verifyAvailableThread("thread-123");

      // Assert
      await expect(threadRepositoryPostgres.verifyAvailableThread("thread-123")).resolves.not.toThrowError(NotFoundError);
      expect(rowCount).toEqual(1);
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

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const replies = await threadRepositoryPostgres.getRepliesByThreadId("thread-123");

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
