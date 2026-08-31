import { LogoutButton } from "@/features/auth/logout-button";

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <h1>Recruiter</h1>
      <LogoutButton />
    </div>
  );
}
