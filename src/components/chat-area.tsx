"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  ArrowLeft,
  ChevronDown,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatMessageTime, formatLastSeen } from "@/lib/utils";
import { ChatSkeleton } from "./skeletons";

interface ChatAreaProps {
  conversationId: Id<"conversations">;
  onBack?: () => void;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export function ChatArea({ conversationId, onBack }: ChatAreaProps) {
  const { user } = useUser();
  const [messageText, setMessageText] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [failedMessages, setFailedMessages] = useState<Map<string, string>>(new Map());
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMessageCountRef = useRef(0);

  const currentUser = useQuery(
    api.users.getUser,
    user ? { clerkId: user.id } : "skip"
  );

  const conversation = useQuery(api.conversations.getConversation, {
    conversationId,
  });

  const messages = useQuery(api.messages.getMessages, { conversationId });

  const typingUsers = useQuery(
    api.messages.getTypingUsers,
    currentUser
      ? { conversationId, currentUserId: currentUser._id }
      : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const setTyping = useMutation(api.messages.setTyping);
  const markAsRead = useMutation(api.messages.markAsRead);

  // Mark as read when conversation is opened or new messages arrive
  useEffect(() => {
    if (currentUser && conversationId) {
      markAsRead({ conversationId, userId: currentUser._id });
    }
  }, [currentUser, conversationId, messages?.length, markAsRead]);

  // Auto-scroll logic
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    isNearBottomRef.current = nearBottom;
    setShowScrollButton(!nearBottom);
  }, []);

  useEffect(() => {
    if (!messages) return;
    const messageCount = messages.length;

    if (messageCount > prevMessageCountRef.current) {
      if (isNearBottomRef.current) {
        setTimeout(() => scrollToBottom(), 50);
      } else {
        // Use startTransition to avoid cascading render warning
        React.startTransition(() => setShowScrollButton(true));
      }
    }
    prevMessageCountRef.current = messageCount;
  }, [messages, scrollToBottom]);

  // Initial scroll when conversation changes or messages first load
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [conversationId, messages, scrollToBottom]);

  // Clear typing on unmount or conversation switch
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (currentUser) {
        setTyping({ conversationId, userId: currentUser._id, isTyping: false });
      }
    };
  }, [conversationId, currentUser, setTyping]);

  const handleTyping = useCallback(() => {
    if (!currentUser) return;

    setTyping({
      conversationId,
      userId: currentUser._id,
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTyping({
        conversationId,
        userId: currentUser._id,
        isTyping: false,
      });
    }, 2000);
  }, [currentUser, conversationId, setTyping]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;

    const content = messageText.trim();
    setMessageText("");

    // Clear typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTyping({
      conversationId,
      userId: currentUser._id,
      isTyping: false,
    });

    const tempId = `temp-${Date.now()}`;

    try {
      await sendMessage({
        conversationId,
        senderId: currentUser._id,
        content,
      });
    } catch {
      setFailedMessages((prev) => new Map(prev).set(tempId, content));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = async (tempId: string) => {
    if (!currentUser) return;
    const content = failedMessages.get(tempId);
    if (!content) return;
    try {
      await sendMessage({
        conversationId,
        senderId: currentUser._id,
        content,
      });
      setFailedMessages((prev) => {
        const next = new Map(prev);
        next.delete(tempId);
        return next;
      });
    } catch {
      // Already in failed state
    }
  };

  const otherUser = conversation?.participantDetails.find(
    (p) => p?._id !== currentUser?._id
  );

  if (conversation === undefined) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="relative">
          <Avatar className="h-9 w-9">
            {conversation?.isGroup ? (
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {conversation.groupName?.charAt(0) ?? "G"}
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={otherUser?.imageUrl} />
                <AvatarFallback>
                  {otherUser?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          {otherUser?.isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>
        <div>
          <p className="font-semibold text-sm">
            {conversation?.isGroup
              ? conversation.groupName
              : otherUser?.name ?? "Loading..."}
          </p>
          <p className="text-xs text-muted-foreground">
            {conversation?.isGroup
              ? `${conversation.participants.length} members`
              : otherUser?.isOnline
                ? "Online"
                : otherUser?.lastSeen
                  ? formatLastSeen(otherUser.lastSeen)
                  : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {!messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-2">
              <Send className="h-6 w-6 opacity-40" />
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUser?._id;

            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
                  {!isOwn && (
                    <Avatar className="h-7 w-7 shrink-0 mt-1">
                      <AvatarImage src={msg.sender?.imageUrl} />
                      <AvatarFallback className="text-xs">
                        {msg.sender?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`relative group rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.isDeleted
                          ? "bg-muted italic text-muted-foreground"
                          : isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                      }`}
                      onClick={() =>
                        !msg.isDeleted &&
                        setActiveReactionMenu(
                          activeReactionMenu === msg._id ? null : msg._id
                        )
                      }
                    >
                      {msg.isDeleted ? (
                        "This message was deleted"
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap wrap-anywhere">{msg.content}</p>
                          {isOwn && !msg.isDeleted && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMessage({ messageId: msg._id });
                              }}
                              className="absolute -top-2 -right-2 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Reactions display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={`flex gap-1 mt-1 flex-wrap ${isOwn ? "justify-end" : ""}`}>
                        {Object.entries(
                          msg.reactions.reduce(
                            (acc: Record<string, string[]>, r) => {
                              if (!acc[r.emoji]) acc[r.emoji] = [];
                              acc[r.emoji].push(r.userId);
                              return acc;
                            },
                            {}
                          )
                        ).map(([emoji, userIds]) => (
                          <button
                            key={emoji}
                            onClick={() =>
                              currentUser &&
                              toggleReaction({
                                messageId: msg._id,
                                userId: currentUser._id,
                                emoji,
                              })
                            }
                            className={`inline-flex items-center gap-0.5 text-xs rounded-full px-1.5 py-0.5 border transition-colors ${
                              currentUser && userIds.includes(currentUser._id)
                                ? "bg-primary/10 border-primary/30"
                                : "bg-muted border-border hover:bg-accent"
                            }`}
                          >
                            {emoji} {userIds.length}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Reaction picker */}
                    {activeReactionMenu === msg._id && !msg.isDeleted && (
                      <div
                        className={`flex gap-1 mt-1 bg-background border rounded-full px-2 py-1 shadow-lg ${
                          isOwn ? "ml-auto" : ""
                        }`}
                      >
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentUser) {
                                toggleReaction({
                                  messageId: msg._id,
                                  userId: currentUser._id,
                                  emoji,
                                });
                              }
                              setActiveReactionMenu(null);
                            }}
                            className="hover:scale-125 transition-transform text-base p-0.5"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    <p
                      className={`text-xs text-muted-foreground mt-1 ${
                        isOwn ? "text-right" : ""
                      }`}
                    >
                      {formatMessageTime(msg._creationTime)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Failed messages */}
        {Array.from(failedMessages.entries()).map(([tempId, content]) => (
          <div key={tempId} className="flex justify-end">
            <div className="max-w-[75%]">
              <div className="rounded-2xl px-3.5 py-2 text-sm bg-destructive/10 border border-destructive/30">
                <p className="wrap-anywhere">{content}</p>
              </div>
              <div className="flex items-center gap-2 text-destructive text-xs mt-1 justify-end">
                <AlertCircle className="h-3 w-3" />
                <span>Failed to send</span>
                <button
                  onClick={() => handleRetry(tempId)}
                  className="flex items-center gap-1 underline"
                >
                  <RefreshCw className="h-3 w-3" /> Retry
                </button>
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="flex justify-center -mt-10 relative z-10 pointer-events-none">
          <button
            onClick={scrollToBottom}
            className="pointer-events-auto bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-xs shadow-lg flex items-center gap-1 hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            New messages
          </button>
        </div>
      )}

      {/* Typing indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="px-4 pb-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {typingUsers.map((u) => u.name).join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing
            <span className="inline-flex gap-0.5">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </span>
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
