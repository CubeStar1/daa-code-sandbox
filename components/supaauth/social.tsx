"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io5";
import { createSupabaseBrowser } from "@/lib/supabase/client";
export default function Social({ redirectTo }: { redirectTo: string }) {
  const loginWithProvider = async (provider: "github" | "google") => {
    const supbase = createSupabaseBrowser();
    await supbase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo:
          window.location.origin + `/auth/callback?next=` + redirectTo,
      },
    });
  };
  return (
    <div className="w-full flex gap-2">
      <Button
        className="flex-1 h-10 sm:h-11 flex items-center justify-center gap-2 text-sm"
        variant="outline"
        onClick={() => loginWithProvider("github")}
      >
        <IoLogoGithub className="w-4 h-4" />
        <span className="truncate">Github</span>
      </Button>
      <Button
        className="flex-1 h-10 sm:h-11 flex items-center justify-center gap-2 text-sm"
        variant="outline"
        onClick={() => loginWithProvider("google")}
      >
        <FcGoogle className="w-4 h-4" />
        <span className="truncate">Google</span>
      </Button>
    </div>
  );
}
