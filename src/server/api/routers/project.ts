import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string(), teamId: z.string().nullish() }))
    .mutation(({ input, ctx }) => {
      if (!input.teamId) {
        return null;
      }
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
      include: {
        team: true,
      },
    });
  }),
  getTeamProjects: protectedProcedure
    .input(z.object({ teamId: z.string().nullish() }))
    .query(({ ctx, input }) => {
      if (!input.teamId) {
        return [];
      }
      return ctx.prisma.project.findMany({
        where: {
          team: {
            id: input.teamId,
          },
        },
      });
    }),
});
