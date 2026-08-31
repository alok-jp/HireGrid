import Link from "next/link";
import { LogoutButton } from "@/features/auth/logout-button";

export default function AdminPage() {
  return (
    <div>
      <div>
        <Link
          href="/admin/invitations"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Invite User
        </Link>
      </div>
      <LogoutButton />
    </div>
  );
}
