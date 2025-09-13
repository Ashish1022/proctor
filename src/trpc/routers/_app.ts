import { testRouter } from "@/modules/test/server/procedure";
import { createTRPCRouter } from "../init";

import { authRouter } from "@/modules/auth/server/procedure";
import { submissionRouter } from "@/modules/submission/server/procedure";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    test: testRouter,
    submission: submissionRouter,
})

export type AppRouter = typeof appRouter;