import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const getCurrentSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});
