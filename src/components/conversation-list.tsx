"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { formatMessageTime } from "@/lib/utils";

interface ConversationListProps {
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (conversationId: Id<"conversations">) => void;
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getUser,
    user ? { clerkId: user.id } : "skip"
  );

  const conversations = useQuery(
    api.conversations.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const unreadCounts = useQuery(
    api.messages.getUnreadCounts,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const getUnreadCount = (conversationId: Id<"conversations">) => {
    if (!unreadCounts) return 0;
    const entry = unreadCounts.find(
      (u) => u.conversationId === conversationId
    );
    return entry?.count ?? 0;
  };

  const getOtherParticipant = (conversation: NonNullable<typeof conversations>[number]) => {
    if (!currentUser) return null;
    return conversation.participantDetails.find(
      (p) => p?._id !== currentUser._id
    );
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-center text-sm font-medium mb-1">
          No conversations yet
        </p>
        <p className="text-center text-xs">
          Search for users above to start chatting!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => {
        const other = conv.isGroup ? null : getOtherParticipant(conv);
        const unread = getUnreadCount(conv._id);
        const isSelected = selectedConversationId === conv._id;

        return (
          <button
            key={conv._id}
            onClick={() => onSelectConversation(conv._id)}
            className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left border-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
              isSelected ? "bg-accent" : ""
            }`}
          >
            <div className="relative">
              <Avatar className="h-11 w-11">
                {conv.isGroup ? (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {conv.groupName?.charAt(0) ?? "G"}
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage
                      src={other?.imageUrl}
                      alt={other?.name ?? "User"}
                    />
                    <AvatarFallback>
                      {other?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              {other?.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate text-sm">
                  {conv.isGroup ? conv.groupName : other?.name ?? "Unknown"}
                </p>
                {conv.lastMessageTime && (
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
                    {formatMessageTime(conv.lastMessageTime)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-muted-foreground truncate">
                  {conv.lastMessagePreview ?? "No messages yet"}
                </p>
                {unread > 0 && (
                  <Badge
                    variant="default"
                    className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full text-xs px-1.5 shrink-0"
                  >
                    {unread}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
