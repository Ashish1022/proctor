import { testRouter } from "@/modules/test/server/procedure";
import { createTRPCRouter } from "../init";

import { authRouter } from "@/modules/auth/server/procedure";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    test: testRouter,
})

export type AppRouter = typeof appRouter;