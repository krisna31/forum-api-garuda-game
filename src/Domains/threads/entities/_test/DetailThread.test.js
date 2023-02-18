const DetailThread = require("../DetailThread");

describe("DetailThread entities", () => {
  it("should throw error when payload not contain needed property", () => {
    // Arrange
    const payload = {
      title: "new thread",
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError("DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 1234,
      title: "1234",
      body: 1234,
      date: "1234",
      username: 1234,
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError("DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION");
  });

  it("should create DetailThread entities correctly", () => {
    const payload = {
      id: "thread-123",
      title: "new title",
      body: "new body",
      date: "2023-08-17T00:00:00.000Z",
      username: "user-1234",
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread).toBeInstanceOf(DetailThread);
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
  });
});
