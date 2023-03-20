import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string(), teamId: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.project.create({
        data: {
          name: input.name,
          team: {
            connect: {
              id: input.teamId,
            },
          },
        },
      });
    }),
  getUserProjects: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.project.findMany({
      where: {
        team: {
          members: {
            some: {
              id: ctx.session.user.id,
            },
          },
        },
      },
    });
  }),
  getTeamProjects: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.project.findMany({
        where: {
          team: {
            id: input.teamId,
          },
        },
      });
    }),
});
