const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadDetailUseCase', () => {
  it('should handle deleted comments and replies correctly', async () => {
    // Arrange
    const mockThreadRepository = {
      getThreadById: jest.fn().mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'A thread',
        body: 'A long thread',
        date: '2023-09-08T07:22:33.555Z',
        username: 'johndoe',
      })),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn().mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          content: 'a comment',
          date: '2023-09-08T07:22:33.555Z',
          username: 'johndoe',
          deleted_at: '2023-09-08T08:22:33.555Z', // Comment is deleted
        },
      ])),
    };

    const mockReplyRepository = {
      getRepliesByCommentId: jest.fn().mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          content: 'a reply',
          date: '2023-09-08T08:22:33.555Z',
          username: 'janedoe',
          deleted_at: '2023-09-08T09:22:33.555Z', // Reply is deleted
        },
      ])),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'A thread',
      body: 'A long thread',
      date: '2023-09-08T07:22:33.555Z',
      username: 'johndoe',
      comments: [
        new CommentDetail({
          id: 'comment-123',
          content: '**komentar telah dihapus**',
          date: '2023-09-08T07:22:33.555Z',
          username: 'johndoe',
          replies: [
            new ReplyDetail({
              id: 'reply-123',
              content: '**balasan telah dihapus**',
              date: '2023-09-08T08:22:33.555Z',
              username: 'janedoe',
            }),
          ],
        }),
      ],
    }));
  });
});

