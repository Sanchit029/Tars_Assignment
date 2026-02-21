import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateConversation = mutation({
  args: {
    participantIds: v.array(v.id("users")),
    isGroup: v.optional(v.boolean()),
    groupName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isGroup = args.isGroup ?? false;

    // For 1-on-1, check if conversation already exists
    if (!isGroup && args.participantIds.length === 2) {
      const allConversations = await ctx.db.query("conversations").collect();
      const existing = allConversations.find(
        (c) =>
          !c.isGroup &&
          c.participants.length === 2 &&
          c.participants.includes(args.participantIds[0]) &&
          c.participants.includes(args.participantIds[1])
      );
      if (existing) return existing._id;
    }

    return await ctx.db.insert("conversations", {
      isGroup,
      groupName: args.groupName,
      participants: args.participantIds,
      lastMessageTime: undefined,
      lastMessagePreview: undefined,
    });
  },
});

export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allConversations = await ctx.db
      .query("conversations")
      .order("desc")
      .collect();

    const userConversations = allConversations.filter((c) =>
      c.participants.includes(args.userId)
    );

    // Sort by lastMessageTime descending
    userConversations.sort((a, b) => {
      const aTime = a.lastMessageTime ?? 0;
      const bTime = b.lastMessageTime ?? 0;
      return bTime - aTime;
    });

    // Get participant details for each conversation
    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (conv) => {
        const participants = await Promise.all(
          conv.participants.map((id) => ctx.db.get(id))
        );
        return {
          ...conv,
          participantDetails: participants.filter(
            (p): p is NonNullable<typeof p> => p !== null
          ),
        };
      })
    );

    return conversationsWithDetails;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return null;

    const participants = await Promise.all(
      conv.participants.map((id) => ctx.db.get(id))
    );

    return {
      ...conv,
      participantDetails: participants.filter(
        (p): p is NonNullable<typeof p> => p !== null
      ),
    };
  },
});
