import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_clerkId", ["clerkId"])
    .index("by_name", ["name"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    participants: v.array(v.id("users")),
    lastMessageTime: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
  }).index("by_lastMessageTime", ["lastMessageTime"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    isDeleted: v.boolean(),
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      userId: v.id("users"),
    }))),
  }).index("by_conversationId", ["conversationId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
    lastTyped: v.number(),
  }).index("by_conversationId", ["conversationId"])
    .index("by_userId_conversationId", ["userId", "conversationId"]),

  unreadCounts: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    count: v.number(),
    lastRead: v.number(),
  }).index("by_userId_conversationId", ["userId", "conversationId"])
    .index("by_userId", ["userId"]),
});
