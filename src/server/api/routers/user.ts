import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!input.email || !input.password || input.password.length < 5) {
        throw new Error("Incorrect Input");
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (user) {
        throw new Error("User already exists");
      }

      const newUser = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: input.password,
        },
      });

      return newUser;
    }),

  signin: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new Error("User does not exist");
      }

      if (user?.password != input.password) {
        throw new Error("Incorrect password");
      }

      return user;
    }),
});
