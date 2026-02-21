"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";
import { UserList } from "./user-list";
import { ConversationList } from "./conversation-list";
import { CreateGroup } from "./create-group";
import { Users, MessageSquare } from "lucide-react";

interface SidebarProps {
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (conversationId: Id<"conversations">) => void;
}

export function Sidebar({
  selectedConversationId,
  onSelectConversation,
}: SidebarProps) {
  const { user } = useUser();
  const [showUsers, setShowUsers] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton />
            <div>
              <p className="font-semibold text-sm">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          <CreateGroup onGroupCreated={(id) => {
            onSelectConversation(id);
            setShowUsers(false);
          }} />
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex border-b px-2 gap-1">
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            !showUsers
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setShowUsers(false)}
        >
          <MessageSquare className="h-4 w-4" />
          Chats
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            showUsers
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setShowUsers(true)}
        >
          <Users className="h-4 w-4" />
          Users
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showUsers ? (
          <UserList
            onSelectConversation={(id) => {
              onSelectConversation(id);
              setShowUsers(false);
            }}
          />
        ) : (
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={onSelectConversation}
          />
        )}
      </div>
    </div>
  );
}
