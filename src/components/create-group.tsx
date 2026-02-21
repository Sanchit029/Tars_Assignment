"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, X } from "lucide-react";

interface CreateGroupProps {
  onGroupCreated: (conversationId: Id<"conversations">) => void;
}

export function CreateGroup({ onGroupCreated }: CreateGroupProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = useQuery(
    api.users.getUser,
    user ? { clerkId: user.id } : "skip"
  );

  const users = useQuery(
    api.users.searchUsers,
    user ? { currentClerkId: user.id, searchTerm } : "skip"
  );

  const createConversation = useMutation(api.conversations.getOrCreateConversation);

  const toggleUser = (userId: Id<"users">) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!currentUser || selectedUsers.length < 2 || !groupName.trim()) return;

    const conversationId = await createConversation({
      participantIds: [currentUser._id, ...selectedUsers],
      isGroup: true,
      groupName: groupName.trim(),
    });

    setOpen(false);
    setGroupName("");
    setSelectedUsers([]);
    setSearchTerm("");
    onGroupCreated(conversationId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Users className="h-4 w-4" />
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <Input
            placeholder="Search users to add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((userId) => {
                const u = users?.find((u) => u._id === userId);
                if (!u) return null;
                return (
                  <span
                    key={userId}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs"
                  >
                    {u.name}
                    <button onClick={() => toggleUser(userId)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* User list */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {users?.map((u) => (
              <button
                key={u._id}
                onClick={() => toggleUser(u._id)}
                className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                  selectedUsers.includes(u._id)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.imageUrl} />
                  <AvatarFallback className="text-xs">
                    {u.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{u.name}</span>
              </button>
            ))}
          </div>

          <Button
            onClick={handleCreate}
            disabled={selectedUsers.length < 2 || !groupName.trim()}
            className="w-full"
          >
            Create Group ({selectedUsers.length} members selected)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
