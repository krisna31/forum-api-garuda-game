const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentTestTableHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('LikesRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('storeLike function', () => {
    it('should persist store like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const payload = {
        commentId: 'comment-123',
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.storeLike(payload.commentId, payload.owner);

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentIdAndOwner(payload.commentId, payload.owner);
      expect(likes).toHaveLength(1);
    });
  });

  describe('verifyLikeExist function', () => {
    it('should return true if liked already with the provided commentId and owner', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLikeExist = await likeRepositoryPostgres.verifyLikeExist(commentId, userId);

      // Assert
      expect(isLikeExist).toBeDefined();
      expect(isLikeExist).toEqual(true);
    });

    it('should return false if not liked with the provided commentId and owner', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLikeExist = await likeRepositoryPostgres.verifyLikeExist('comment-123', 'user-123');

      // Assert
      expect(isLikeExist).toBeDefined();
      expect(isLikeExist).toEqual(false);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like by commentId and owner correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.deleteLike(commentId, userId);

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentIdAndOwner(commentId, userId);
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeCount function', () => {
    it('should get like count by commentId correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const likeCount = await likeRepositoryPostgres.getLikeCount(commentId);

      // Assert
      expect(likeCount).toBeDefined();
      expect(likeCount).toEqual(1);
    });
  });
});
