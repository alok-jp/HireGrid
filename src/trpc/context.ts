import { getCurrentSession } from "@/lib/get-session";

export async function createTRPCContext() {
  const session = await getCurrentSession();

  return {
    session,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
