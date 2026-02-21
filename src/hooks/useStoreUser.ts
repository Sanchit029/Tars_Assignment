"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function useStoreUser() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!isLoaded || !user) return;

    upsertUser({
      clerkId: user.id,
      name: user.fullName ?? user.firstName ?? "User",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl: user.imageUrl,
    });

    // Set online when loaded
    setOnlineStatus({ clerkId: user.id, isOnline: true });

    // Set offline when leaving
    const handleBeforeUnload = () => {
      setOnlineStatus({ clerkId: user.id, isOnline: false });
    };

    const handleVisibilityChange = () => {
      setOnlineStatus({
        clerkId: user.id,
        isOnline: !document.hidden,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoaded, user, upsertUser, setOnlineStatus]);
}
