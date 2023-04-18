import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const teamRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.team.create({
        data: {
          name: input.name,
          owner: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          members: {
            create: {
              user: {
                connect: {
                  id: ctx.session.user.id,
                },
              },
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const team = await ctx.prisma.team.findUnique({
        where: {
          id: input.id,
        },
      });

      if (team?.ownerId !== ctx.session.user.id) {
        return null;
      }

      return ctx.prisma.team.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const team = await ctx.prisma.team.findUnique({
        where: {
          id: input.id,
        },
      });

      if (team?.ownerId !== ctx.session.user.id) {
        return null;
      }

      return ctx.prisma.team.delete({
        where: {
          id: input.id,
        },
        include: {
          members: true,
        },
      });
    }),

  removeMember: protectedProcedure
    .input(z.object({ memberId: z.string(), teamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.prisma.team.findUnique({
        where: { id: input.teamId },
      });

      if (team?.ownerId === input.memberId) {
        return null;
      }

      return ctx.prisma.usersOnTeams.delete({
        where: {
          userId_teamId: {
            teamId: input.teamId,
            userId: input.memberId,
          },
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
    });
  }),
  getTeamMembers: protectedProcedure
    .input(z.object({ id: z.string().nullish() }))
    .query(({ input, ctx }) => {
      if (!input.id) {
        return null;
      }
      return ctx.prisma.team.findUnique({
        where: {
          id: input.id,
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });
    }),

  // assignToTeam: protectedProcedure.mutation({id})
});
