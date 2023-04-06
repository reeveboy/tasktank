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
});
