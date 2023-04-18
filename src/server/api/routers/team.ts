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
