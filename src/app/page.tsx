"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import { ChatLayout } from "@/components/chat-layout";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-8">
          <MessageSquare className="h-16 w-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold mb-2">TARS Chat</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            A real-time chat application. Sign in to start messaging.
          </p>
          <SignInButton mode="modal">
            <Button size="lg" className="text-base px-8">
              Get Started
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <ChatLayout />
      </SignedIn>
    </>
  );
}
