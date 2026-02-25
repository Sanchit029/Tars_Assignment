"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";
import { MessageSquare } from "lucide-react";
import { useStoreUser } from "@/hooks/useStoreUser";

export function ChatLayout() {
  useStoreUser();

  const { user } = useUser();
  const currentUser = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const unreadCounts = useQuery(
    api.messages.getUnreadCounts,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  useEffect(() => {
    const total = unreadCounts?.reduce((sum, u) => sum + u.count, 0) ?? 0;
    document.title = total > 0 ? `(${total}) TARS Chat` : "TARS Chat";
    return () => { document.title = "TARS Chat"; };
  }, [unreadCounts]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);

  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");

  const handleSelectConversation = (id: Id<"conversations">) => {
    setSelectedConversationId(id);
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("sidebar");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden on mobile when chat is open */}
      <div
        className={`w-full md:w-87.5 lg:w-95 border-r shrink-0 ${
          mobileView === "chat" ? "hidden md:flex" : "flex"
        } flex-col`}
      >
        <Sidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat area */}
      <div
        className={`flex-1 ${
          mobileView === "sidebar" ? "hidden md:flex" : "flex"
        } flex-col`}
      >
        {selectedConversationId ? (
          <ChatArea
            conversationId={selectedConversationId}
            onBack={handleBack}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-2">
              <MessageSquare className="h-9 w-9 opacity-40" />
            </div>
            <p className="text-lg font-medium text-foreground">Welcome to TARS Chat</p>
            <p className="text-sm max-w-xs text-center">
              Select a conversation from the sidebar or find users to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
