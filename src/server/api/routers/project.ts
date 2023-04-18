import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string(), teamId: z.string().nullish() }))
    .mutation(async ({ input, ctx }) => {
      if (!input.teamId) {
        return null;
      }

      const team = await ctx.prisma.team.findUnique({
        where: {
          id: input.teamId,
        },
      });

      if (team?.ownerId !== ctx.session.user.id) return null;

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

  update: protectedProcedure
    .input(
      z.object({ projectId: z.string(), teamId: z.string(), name: z.string() })
    )
    .mutation(async ({ input, ctx }) => {
      const team = await ctx.prisma.team.findUnique({
        where: { id: input.teamId },
      });

      if (team?.ownerId !== ctx.session.user.id) {
        return null;
      }

      return ctx.prisma.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          name: input.name,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ projectId: z.string(), teamId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const team = await ctx.prisma.team.findUnique({
        where: { id: input.teamId },
      });

      if (team?.ownerId !== ctx.session.user.id) {
        return null;
      }

      return ctx.prisma.project.delete({ where: { id: input.projectId } });
    }),
  getUserProjects: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.project.findMany({
      where: {
        team: {
          members: {
            some: {
              userId: ctx.session.user.id,
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
        include: {
          team: true,
        },
      });
    }),
});
