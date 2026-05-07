import { zValidator } from "@hono/zod-validator";
import type { Prisma } from "@prisma/client-generated";
import { Hono } from "hono";
import { z } from "zod";
import { parseTopicSessionState, PersistedPhaseSchema } from "../../lib/phase";
import { db } from "../db";
import type { AuthEnv } from "../middleware/requireAuth";

const paramSchema = z.object({ taskId: z.string().min(1) });

export const topicSessionRoute = new Hono<AuthEnv>()
  .get("/topic-sessions/:taskId", zValidator("param", paramSchema), async (c) => {
    const userId = c.var.user.id;
    const { taskId } = c.req.valid("param");

    const session = await db.topicSession.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    if (!session) return c.json({ state: null });
    return c.json({ state: parseTopicSessionState(session.phaseData) });
  })

  .put(
    "/topic-sessions/:taskId",
    zValidator("param", paramSchema),
    zValidator("json", z.object({ phase: PersistedPhaseSchema })),
    async (c) => {
      const userId = c.var.user.id;
      const { taskId } = c.req.valid("param");
      const { phase } = c.req.valid("json");

      const existing = await db.topicSession.findUnique({
        where: { userId_taskId: { userId, taskId } },
      });
      const prev = existing ? parseTopicSessionState(existing.phaseData) : { phases: {} };
      const next = { phases: { ...prev.phases, [phase.name]: phase } };
      const data = next as unknown as Prisma.InputJsonValue;

      await db.topicSession.upsert({
        where: { userId_taskId: { userId, taskId } },
        update: { phaseData: data },
        create: { userId, taskId, phaseData: data },
      });

      return c.json({ ok: true });
    },
  )

  .delete("/topic-sessions/:taskId", zValidator("param", paramSchema), async (c) => {
    const userId = c.var.user.id;
    const { taskId } = c.req.valid("param");

    await db.topicSession.deleteMany({ where: { userId, taskId } });

    return c.json({ ok: true });
  });
