import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { teamRouter } from "./routers/team";
import { projectRouter } from "./routers/project";
import { taskRouter } from "./routers/task";
import { inviteRouter } from "./routers/invite";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  team: teamRouter,
  project: projectRouter,
  task: taskRouter,
  invite: inviteRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
