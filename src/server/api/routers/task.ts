import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({ name: z.string(), projectId: z.string(), date: z.date() })
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
    .input(z.object({ date: z.date() }))
    .query(async ({ input, ctx }) => {
      const tasks = await ctx.prisma.task.findMany({
        where: {
          date: input.date,
          user: {
            id: ctx.session.user.id,
          },
        },
        include: {
          project: {
            include: {
              team: true,
            },
          },
        },
      });
      return tasks;
    }),
  getProjectTasks: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      const tasks = await ctx.prisma.task.findMany({
        where: {
          projectId: input.projectId,
          user: {
            id: ctx.session.user.id,
          },
        },
        include: {
          user: true,
        },
      });
      return tasks;
    }),
  toggleComplete: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const task = await ctx.prisma.task.findUnique({
        where: {
          id: input.taskId,
        },
      });
      if (!task) {
        throw new Error("Task not found");
      }
      return ctx.prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          competed: !task.competed,
        },
      });
    }),
});
