import { describe, it, expect, beforeEach } from 'vitest';
import { ReplyMessageService } from '@/lib/reply-message-service';

describe('ReplyMessageService', () => {
  beforeEach(() => {
    // Reset before each test
  });

  it('should create a reply message', async () => {
    const reply = await ReplyMessageService.createReply({
      chatId: 'chat_1',
      userId: 'user_1',
      text: 'This is a reply',
      replyToMessageId: 'msg_1',
      replyToSenderId: 'user_2',
      replyToSenderName: 'John',
      replyToText: 'Original message',
      replyToTimestamp: Date.now(),
    });

    expect(reply).toBeDefined();
    expect(reply.id).toBeDefined();
    expect(reply.text).toBe('This is a reply');
    expect(reply.replyTo).toBeDefined();
    expect(reply.replyTo?.text).toBe('Original message');
  });

  it('should get empty replies initially', async () => {
    const replies = await ReplyMessageService.getReplies('msg_1');
    expect(replies).toEqual([]);
  });

  it('should delete a reply', async () => {
    const result = await ReplyMessageService.deleteReply('reply_1', 'user_1');
    expect(result).toBe(true);
  });

  it('should edit a reply', async () => {
    const edited = await ReplyMessageService.editReply(
      'reply_1',
      'user_1',
      'Edited reply text'
    );

    expect(edited).toBeDefined();
    expect(edited.text).toBe('Edited reply text');
  });

  it('should get reply thread', async () => {
    const thread = await ReplyMessageService.getReplyThread('msg_1');
    expect(Array.isArray(thread)).toBe(true);
  });

  it('should quote a message', async () => {
    const quote = await ReplyMessageService.quoteMessage({
      chatId: 'chat_1',
      userId: 'user_1',
      text: 'I agree with this',
      replyToMessageId: 'msg_1',
      replyToSenderId: 'user_2',
      replyToSenderName: 'John',
      replyToText: 'Important message',
      replyToTimestamp: Date.now(),
    });

    expect(quote).toBeDefined();
    expect(quote.replyTo?.text).toBe('Important message');
  });

  it('should get threaded messages', async () => {
    const messages = await ReplyMessageService.getThreadedMessages('chat_1');
    expect(Array.isArray(messages)).toBe(true);
  });

  it('should toggle thread collapse', async () => {
    const result = await ReplyMessageService.toggleThreadCollapse('msg_1');
    expect(result).toBe(true);
  });

  it('should get message with replies', async () => {
    const result = await ReplyMessageService.getMessageWithReplies('msg_1');
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.replies).toBeDefined();
    expect(Array.isArray(result.replies)).toBe(true);
  });
});
