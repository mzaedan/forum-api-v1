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
 
    const mockThreadData = {
      id: 'thread-123',
      title: 'A thread',
      body: 'A long thread',
      date: '2023-09-22T00:00:00.000Z',
      username: 'foobar',
    };
 
    const mockCommentData = {
      id: 'comment-123',
      username: 'johndoe',
      date: '2023-09-08T07:22:33.555Z',
      content: 'a comment',
      deleted_at: null, // Ubah dari undefined ke null
    };
 
    const mockReplyData = { // Pastikan mockReplyData didefinisikan
      id: 'reply-123',
      username: 'johndoe',
      date: '2023-09-08T07:22:33.555Z',
      content: 'a reply',
    };
 
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
 
    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadData));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([mockCommentData]));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
 
    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });
 
    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);
 
    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      ...mockThreadData,
      comments: [new CommentDetail({ ...mockCommentData, replies: [] })],
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(mockCommentData.id);
  });

  it('should handle comment with replies and deleted comment correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThreadData = {
      id: 'thread-123',
      title: 'A thread',
      body: 'A long thread',
      date: '2023-09-22T00:00:00.000Z',
      username: 'foobar',
    };

    const mockCommentData = {
      id: 'comment-123',
      username: 'johndoe',
      date: '2023-09-08T07:22:33.555Z',
      content: 'a comment',
      deleted_at: null, // Sesuaikan dengan null
    };

    const mockReplyData = {
      id: 'reply-123',
      username: 'johndoe',
      date: '2023-09-08T07:22:33.555Z',
      content: 'a reply',
      deleted_at: null, // Sesuaikan dengan null
    };

    const mockDeletedCommentData = {
      id: 'comment-456',
      username: 'johndoe',
      date: '2023-09-08T07:22:33.555Z',
      content: '**komentar telah dihapus**',
      deleted_at: '2023-09-08T07:22:33.555Z',
    };

    const mockDeletedReplyData = {
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
      .mockImplementation(() => Promise.resolve(mockThreadData));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([mockCommentData, mockDeletedCommentData]));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation((commentId) => {
        if (commentId === mockCommentData.id) {
          return Promise.resolve([mockReplyData]);
        } else if (commentId === mockDeletedCommentData.id) {
          return Promise.resolve([mockDeletedReplyData]);
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
      ...mockThreadData,
      comments: [
        new CommentDetail({
          ...mockCommentData,
          replies: [new ReplyDetail(mockReplyData)],
        }),
        new CommentDetail({
          ...mockDeletedCommentData,
          replies: [new ReplyDetail(mockDeletedReplyData)],
        }),
      ],
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledTimes(2);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(mockCommentData.id);
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(mockDeletedCommentData.id);
  });
});

