"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import { ChatLayout } from "@/components/chat-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-background to-muted/50 p-8">
          <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-primary/10 mb-8">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">TARS Chat</h1>
          <p className="text-muted-foreground mb-2 text-center max-w-md text-lg">
            Real-time messaging, group chats, and reactions.
          </p>
          <p className="text-muted-foreground/70 mb-10 text-center max-w-sm text-sm">
            Sign in to start a conversation with anyone, instantly.
          </p>
          <SignInButton mode="modal">
            <Button size="lg" className="text-base px-8 h-12 rounded-xl">
              Get Started
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <ErrorBoundary>
          <ChatLayout />
        </ErrorBoundary>
      </SignedIn>
    </>
  );
}
