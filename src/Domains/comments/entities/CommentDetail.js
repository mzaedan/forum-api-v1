class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.content = payload.content;
    this.date = payload.date;
    this.replies = payload.replies;
    this.deleted_at = payload.deleted_at;
  }

  _verifyPayload(payload) {
    const {
      id,
      username,
      content,
      date,
      replies,
      deleted_at,
    } = payload;

    if (!id || !username || !content || !date) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || (typeof date !== 'string' && typeof date !== 'object')
      || !Array.isArray(replies)
      || (deleted_at !== null && deleted_at !== undefined && typeof deleted_at !== 'string')
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetail;
