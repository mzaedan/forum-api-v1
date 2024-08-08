const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
 
describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
 
    const mockThreadDetail = new ThreadDetail({
      id: 'thread-123',
      title: 'A thread',
      body: 'A long thread',
      date: '2023-09-22T00:00:00.000Z',
      username: 'foobar',
      comments: [],
    });
 
    const mockComment = new CommentDetail({
      id: 'comment-123',
      username: 'johndoe',
      date: '2023-09-08T07:22:33.555Z',
      content: 'a comment',
      replies: [],
    });
 
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockreplyRepository = new ReplyRepository();
 
    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadDetail));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([mockComment]));
    mockreplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
 
    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockreplyRepository,
    });
 
    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);
 
    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      ...threadDetail,
      comments: [mockComment],
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockreplyRepository.getRepliesByCommentId).toBeCalledWith(mockComment.id);
  });

  it('should handle comment with replies and deleted comment correctly', async () => {
  // Arrange
  const threadId = 'thread-123';

  const mockThreadDetail = new ThreadDetail({
    id: 'thread-123',
    title: 'A thread',
    body: 'A long thread',
    date: '2023-09-22T00:00:00.000Z',
    username: 'foobar',
    comments: [],
  });

  const mockComment = new CommentDetail({
    id: 'comment-123',
    username: 'johndoe',
    date: '2023-09-08T07:22:33.555Z',
    content: 'a comment',
    replies: [],
  });

  const mockReply = {
    id: 'reply-123',
    username: 'johndoe',
    date: '2023-09-08T07:22:33.555Z',
    content: 'a reply',
  };

  const mockDeletedComment = new CommentDetail({
    id: 'comment-456',
    username: 'johndoe',
    date: '2023-09-08T07:22:33.555Z',
    content: '**komentar telah dihapus**',
    deleted_at: '2023-09-08T07:22:33.555Z',
    replies: [],
  });

  const mockDeletedReply = {
    id: 'reply-456',
    username: 'johndoe',
    date: '2023-09-08T07:22:33.555Z',
    content: '**balasan telah dihapus**',
    deleted_at: '2023-09-08T07:22:33.555Z',
  };

  const mockThreadRepository = new ThreadRepository();
  const mockCommentRepository = new CommentRepository();
  const mockReplyRepository = new ReplyRepository();

  mockThreadRepository.getThreadById = jest.fn()
    .mockImplementation(() => Promise.resolve(mockThreadDetail));
  mockCommentRepository.getCommentsByThreadId = jest.fn()
    .mockImplementation(() => Promise.resolve([mockComment, mockDeletedComment]));
  mockReplyRepository.getRepliesByCommentId = jest.fn()
    .mockImplementation((commentId) => {
      if (commentId === mockComment.id) {
        return Promise.resolve([mockReply]);
      } else if (commentId === mockDeletedComment.id) {
        return Promise.resolve([mockDeletedReply]);
      } else {
        return Promise.resolve([]);
      }
    });

  const getThreadDetailUseCase = new GetThreadDetailUseCase({
    threadRepository: mockThreadRepository,
    commentRepository: mockCommentRepository,
    replyRepository: mockReplyRepository,
  });

  // Action
  const threadDetail = await getThreadDetailUseCase.execute(threadId);

  // Assert
  expect(threadDetail).toStrictEqual(new ThreadDetail({
    ...threadDetail,
    comments: [
      new CommentDetail({
        ...mockComment,
        replies: [new ReplyDetail(mockReply)],
      }),
      new CommentDetail({
        ...mockDeletedComment,
        replies: [new ReplyDetail(mockDeletedReply)],
      }),
    ],
  }));
  expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
  expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledTimes(2);
  expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(mockComment.id);
  expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(mockDeletedComment.id);
});
});