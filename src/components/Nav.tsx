"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocalStorage } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/form", label: "Digital form" },
  { href: "/history", label: "History" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const localMode = useLocalStorage();

  if (pathname === "/login") return null;

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3">
        <span className="text-sm font-bold text-slate-900">Sirrond</span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                pathname === l.href
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {!localMode && (
            <button
              onClick={logout}
              className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
