import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { sendInviteMail } from "~/utils/sendInviteMail";

export const inviteRouter = createTRPCRouter({
  sendInvite: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        teamId: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.teamId) {
        return null;
      }
      const invite = await ctx.prisma.invite.create({
        data: {
          email: input.email,
          team: {
            connect: {
              id: input.teamId,
            },
          },
          invitedBy: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
      await sendInviteMail({
        inviteId: invite.id,
        to: invite.email,
        from: user?.email || "",
      });
      return invite;
    }),

  getInvite: protectedProcedure
    .input(z.object({ inviteId: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      if (!input.inviteId) {
        return null;
      }
      const invite = await ctx.prisma.invite.findUnique({
        where: {
          id: input.inviteId,
        },
        include: {
          team: true,
          invitedBy: true,
        },
      });

      if (!invite) {
        return null;
      }

      if (ctx.session.user.email !== invite.email) {
        return null;
      }

      return invite;
    }),

  acceptInvite: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const invite = await ctx.prisma.invite.findUnique({
        where: {
          id: input.inviteId,
        },
      });
      if (!invite) {
        return null;
      }
      await ctx.prisma.team.update({
        where: {
          id: invite.teamId,
        },
        data: {
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
      await ctx.prisma.invite.delete({
        where: {
          id: invite.id,
        },
      });
      return invite;
    }),

  declineInvite: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const invite = await ctx.prisma.invite.findUnique({
        where: {
          id: input.inviteId,
        },
      });
      if (!invite) {
        return null;
      }
      await ctx.prisma.invite.delete({
        where: {
          id: invite.id,
        },
      });
      return invite;
    }),
});
