"use client";

import { logout } from "@/app/(admin)/admin/actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout} className="w-full">
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
      >
        <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
        Logout
      </button>
    </form>
  );
}