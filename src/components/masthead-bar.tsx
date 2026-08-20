import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export function MastheadBar() {
  const { isPending } = useCurrentUserState();
  return (
    <div className="border-b border-ink bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <nav className="flex items-center gap-4 text-xs tracking-[0.2em]">
          <Link to="/" className="font-display text-sm tracking-[0.25em]">
            默哀报
          </Link>
          <NavLink to="/watch">看片</NavLink>
          <NavLink to="/guide">指南</NavLink>
          <NavLink to="/morgue">停尸房</NavLink>
          <NavLink to="/press">编辑部</NavLink>
        </nav>
        <div className="min-h-8 shrink-0 text-xs">
          {isPending ? (
            <div className="h-8 w-24 bg-paper-deep" />
          ) : (
            <>
              <SignedIn>
                <div className="[&_button]:tracking-widest [&_span]:max-w-24 [&_span]:truncate">
                  <UserButton />
                </div>
              </SignedIn>
              <SignedOut>
                <Link
                  to="/login"
                  className="inline-flex h-8 items-center border border-ink px-3 tracking-widest hover:bg-ink hover:text-paper"
                >
                  入内
                </Link>
              </SignedOut>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NavLink({
  to,
  children,
}: {
  to: "/morgue" | "/press" | "/watch" | "/guide";
  children: string;
}) {
  return (
    <Link
      to={to}
      className={cn("text-ink-soft hover:text-ink")}
      activeProps={{ className: "text-ink underline decoration-seal underline-offset-4" }}
    >
      {children}
    </Link>
  );
}
