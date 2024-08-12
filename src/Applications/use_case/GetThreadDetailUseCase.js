const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    const threadComments = await this._commentRepository.getCommentsByThreadId(threadId);

    threadDetail.comments = await Promise.all(threadComments.map(async (comment) => {
        const commentReplies = await this._replyRepository.getRepliesByCommentId(comment.id);

        const replies = commentReplies.map((reply) => new ReplyDetail({
            ...reply,
            content: reply.deleted_at ? '**balasan telah dihapus**' : reply.content,
            deleted_at: reply.deleted_at || null,
        }));

        return new CommentDetail({
            ...comment,
            content: comment.deleted_at ? '**komentar telah dihapus**' : comment.content,
            deleted_at: comment.deleted_at || null,
            replies: replies, // pastikan replies diisi dengan balasan yang sudah diproses
        });
    }));

    return new ThreadDetail(threadDetail);
}

}

module.exports = GetThreadDetailUseCase;
