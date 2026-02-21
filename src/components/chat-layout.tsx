"use client";

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";
import { MessageSquare } from "lucide-react";
import { useStoreUser } from "@/hooks/useStoreUser";

export function ChatLayout() {
  useStoreUser();

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
        className={`w-full md:w-[350px] lg:w-[380px] border-r flex-shrink-0 ${
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
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Welcome to TARS Chat</p>
            <p className="text-sm mt-1">
              Select a conversation or find users to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
