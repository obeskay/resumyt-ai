import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export const createRouteHandler = () => {
  return createRouteHandlerClient<Database>({ cookies });
};
