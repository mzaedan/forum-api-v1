const NewComment = require('../NewComment');

describe('NewComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = { threadId: 123, content: 'a comment', owner: 'user-123' };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment entities correctly', () => {
    // Arrange
    const payload = { threadId: 'thread-123', content: 'a comment', owner: 'user-123' };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.owner).toEqual(payload.owner);
  });

  it('should verify payload correctly', () => {
    // Arrange
    const payload = { threadId: 'thread-123', content: 'a comment', owner: 'user-123' };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment._verifyPayload).toBeDefined();
  });

  it('should initialize properties correctly', () => {
    // Arrange
    const payload = { threadId: 'thread-123', content: 'a comment', owner: 'user-123' };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment.threadId).toBe(payload.threadId);
    expect(newComment.content).toBe(payload.content);
    expect(newComment.owner).toBe(payload.owner);
  });
});
