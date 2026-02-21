import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.content.length > 5000) {
      throw new Error("Message too long");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      isDeleted: false,
      reactions: [],
    });

    // Update conversation preview
    await ctx.db.patch(args.conversationId, {
      lastMessageTime: Date.now(),
      lastMessagePreview: args.content.substring(0, 50),
    });

    // Increment unread counts for other participants
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      for (const participantId of conversation.participants) {
        if (participantId === args.senderId) continue;

        const existing = await ctx.db
          .query("unreadCounts")
          .withIndex("by_userId_conversationId", (q) =>
            q.eq("userId", participantId).eq("conversationId", args.conversationId)
          )
          .unique();

        if (existing) {
          await ctx.db.patch(existing._id, { count: existing.count + 1 });
        } else {
          await ctx.db.insert("unreadCounts", {
            conversationId: args.conversationId,
            userId: participantId,
            count: 1,
            lastRead: 0,
          });
        }
      }
    }

    // Clear typing indicator
    const typingIndicator = await ctx.db
      .query("typingIndicators")
      .withIndex("by_userId_conversationId", (q) =>
        q.eq("userId", args.senderId).eq("conversationId", args.conversationId)
      )
      .unique();

    if (typingIndicator) {
      await ctx.db.patch(typingIndicator._id, { isTyping: false });
    }

    return messageId;
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    // Get sender details for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return { ...msg, sender };
      })
    );

    return messagesWithSenders;
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    const reactions = message.reactions ?? [];
    const existingIndex = reactions.findIndex(
      (r) => r.emoji === args.emoji && r.userId === args.userId
    );

    if (existingIndex >= 0) {
      reactions.splice(existingIndex, 1);
    } else {
      reactions.push({ emoji: args.emoji, userId: args.userId });
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_userId_conversationId", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: args.isTyping,
        lastTyped: Date.now(),
      });
    } else {
      await ctx.db.insert("typingIndicators", {
        conversationId: args.conversationId,
        userId: args.userId,
        isTyping: args.isTyping,
        lastTyped: Date.now(),
      });
    }
  },
});

export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const typingUsers = [];
    const now = Date.now();

    for (const indicator of indicators) {
      // Only show typing if within last 3 seconds and not current user
      if (
        indicator.isTyping &&
        indicator.userId !== args.currentUserId &&
        now - indicator.lastTyped < 3000
      ) {
        const user = await ctx.db.get(indicator.userId);
        if (user) typingUsers.push(user);
      }
    }

    return typingUsers;
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("unreadCounts")
      .withIndex("by_userId_conversationId", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { count: 0, lastRead: Date.now() });
    }
  },
});

export const getUnreadCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("unreadCounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
