import { z } from "zod";
import { Worker } from "bullmq";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  onPost: publicProcedure.subscription(() => {
    return observable<Post>((emit) => {
      const messageWorker = new Worker(
        'test',
        async (job) => {
          if (typeof job.data === 'string') {
            // TODO: Action on message received
            emit.next((job as Job<Post>).data)
          }

        },
      )

      return () => {
        void messageWorker.close()
      }
    })
  }),
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({ orderBy: { id: "desc" } });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.post.findFirst({ where: { id: input.id } });
    }),
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.post.create({ data: input });
    }),
  delete: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.post.delete({ where: { id: input } });
  }),
});
