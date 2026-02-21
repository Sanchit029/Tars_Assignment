"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageCircle, Users } from "lucide-react";

interface UserListProps {
  onSelectConversation: (conversationId: Id<"conversations">) => void;
}

export function UserList({ onSelectConversation }: UserListProps) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = useQuery(
    api.users.getUser,
    user ? { clerkId: user.id } : "skip"
  );

  const users = useQuery(
    api.users.searchUsers,
    user
      ? { currentClerkId: user.id, searchTerm: searchTerm }
      : "skip"
  );

  const createConversation = useMutation(api.conversations.getOrCreateConversation);

  const handleUserClick = async (targetUserId: Id<"users">) => {
    if (!currentUser) return;

    const conversationId = await createConversation({
      participantIds: [currentUser._id, targetUserId],
    });

    onSelectConversation(conversationId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Find Users
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!users || users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <MessageCircle className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-center text-sm">
              {searchTerm
                ? "No users found matching your search."
                : "No other users have joined yet. Share the app!"}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {users.map((u) => (
              <button
                key={u._id}
                onClick={() => handleUserClick(u._id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.imageUrl} alt={u.name} />
                    <AvatarFallback>
                      {u.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {u.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email}
                  </p>
                </div>
                {u.isOnline && (
                  <span className="text-xs text-green-500 font-medium">
                    Online
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
