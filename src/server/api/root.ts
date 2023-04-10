import { createTRPCRouter } from "~/server/api/trpc";
import { teamRouter } from "./routers/team";
import { projectRouter } from "./routers/project";
import { taskRouter } from "./routers/task";
import { inviteRouter } from "./routers/invite";
import { messageRouter } from "./routers/message";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  team: teamRouter,
  project: projectRouter,
  task: taskRouter,
  invite: inviteRouter,
  message: messageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
