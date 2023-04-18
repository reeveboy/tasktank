import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const messageRouter = createTRPCRouter({
  getChats: protectedProcedure
    .input(
      z.object({
        recieverId: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session.user.id || !input.recieverId) {
        return null;
      }
      const chats = await ctx.prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: ctx.session.user.id,
              receiverId: input.recieverId,
            },
            {
              senderId: input.recieverId,
              receiverId: ctx.session.user.id,
            },
          ],
        },
      });
      return chats;
    }),

  getGroupChat: protectedProcedure
    .input(z.object({ teamId: z.string().nullish() }))
    .query(({ input, ctx }) => {
      if (!input.teamId) {
        return null;
      }

      return ctx.prisma.message.findMany({
        where: {
          teamId: input.teamId,
        },
        include: {
          sender: true,
        },
      });
    }),

  sendDM: protectedProcedure
    .input(
      z.object({
        recieverId: z.string().nullish(),
        message: z.string(),
        teamId: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user.id || !input.message) {
        return null;
      }
      const chats = await ctx.prisma.message.create({
        data: {
          senderId: ctx.session.user.id,
          receiverId: input.recieverId,
          message: input.message,
          teamId: input.teamId,
        },
      });
      return chats;
    }),

  updateStatus: protectedProcedure
    .input(z.object({ recieverId: z.string().nullish() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user.id || !input.recieverId) {
        return null;
      }
      const chats = await ctx.prisma.message.updateMany({
        where: {
          senderId: input.recieverId,
          receiverId: ctx.session.user.id,
          status: "unread",
        },
        data: {
          status: "read",
        },
      });
      return chats;
    }),
});
