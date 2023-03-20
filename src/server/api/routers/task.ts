import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({ name: z.string(), projectId: z.string(), date: z.string() })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.task.create({
        data: {
          name: input.name,
          project: {
            connect: {
              id: input.projectId,
            },
          },
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          date: input.date,
        },
      });
    }),
  getDaysTasks: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ input, ctx }) => {
      const tasks = await ctx.prisma.task.findMany({
        where: {
          date: input.date,
          user: {
            id: ctx.session.user.id,
          },
        },
      });
      return tasks;
    }),
});
