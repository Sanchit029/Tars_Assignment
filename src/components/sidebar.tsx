"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";
import { UserList } from "./user-list";
import { ConversationList } from "./conversation-list";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
            <UserButton afterSignOutUrl="/" />
            <div>
              <p className="font-semibold text-sm">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex border-b">
        <Button
          variant={showUsers ? "ghost" : "secondary"}
          className="flex-1 rounded-none gap-2"
          onClick={() => setShowUsers(false)}
        >
          <MessageSquare className="h-4 w-4" />
          Chats
        </Button>
        <Button
          variant={showUsers ? "secondary" : "ghost"}
          className="flex-1 rounded-none gap-2"
          onClick={() => setShowUsers(true)}
        >
          <Users className="h-4 w-4" />
          Users
        </Button>
      </div>

      <Separator />

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
