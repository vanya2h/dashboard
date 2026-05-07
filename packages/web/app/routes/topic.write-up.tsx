import { Trans, useLingui } from "@lingui/react/macro";
import { useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router";
import { Markdown } from "../../src/components/Markdown";
import { TopicActionBar } from "../../src/components/TopicActionBar";
import { TopicContainer } from "../../src/components/TopicContainer";
import { useProgress } from "../../src/hooks/useProgress";
import { useStreamAI } from "../../src/hooks/useStreamAI";
import { useTopicSession } from "../../src/hooks/useTopicSession";
import { parseTopicSessionState, WRITEUP_SYSTEM } from "../../src/lib/phase";
import { db } from "../../src/server/db";
import { requireSession } from "../../src/server/session";
import type { Route } from "./+types/topic.write-up";

import { Card } from "~/components/Card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";

const TOKENS_WRITEUP = 250;

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await requireSession(request);
  const record = await db.topicSession.findUnique({
    where: {
      userId_taskId: {
        userId: session.user.id,
        taskId: params.taskId,
      },
    },
  });
  const state = record ? parseTopicSessionState(record.phaseData) : { phases: {} };
  const phase = state.phases["write-up"];
  if (!phase) {
    throw new Response("Not found", { status: 404 });
  }
  return {
    material: phase.material,
    partIdx: phase.partIdx,
    savedFeedback: phase.feedback,
  };
}

export default function WriteUpPage() {
  const { material, partIdx, savedFeedback } = useLoaderData<typeof loader>();
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { stream, streaming, abort } = useStreamAI();
  const { saveSession, deleteSession } = useTopicSession(taskId!);
  const { toggleTask } = useProgress();
  const { t } = useLingui();

  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState(savedFeedback);

  const { parts } = material;
  const part = parts[partIdx]!;

  async function handleSubmit() {
    setFeedback("");
    const result = await stream(
      WRITEUP_SYSTEM,
      `Topic: "${part.title}"\nLearner's reflection: "${text}"`,
      setFeedback,
      TOKENS_WRITEUP,
    );
    if (result !== null) {
      void saveSession({
        name: "write-up",
        material,
        partIdx,
        feedback: result,
      });
    }
  }

  async function handleComplete() {
    abort();
    if (taskId) await toggleTask(taskId);
    void deleteSession();
    void navigate("../complete", { relative: "path" });
  }

  return (
    <>
      <TopicContainer className="py-8">
        <Card.List>
          <Card.Entry>
            <div className="flex flex-col">
              <Card.Heading>
                <Trans>Reflect</Trans>
              </Card.Heading>
              <Card.CardSubheading>{part.writeUpPrompt}</Card.CardSubheading>
            </div>
          </Card.Entry>

          <Card.Entry>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t`Write your reflection in your own words…`}
              rows={4}
              aria-label={t`Text input`}
              disabled={streaming || !!feedback}
            />
          </Card.Entry>

          {(feedback || streaming) && (
            <Card.Entry>
              <Card.Heading className="mb-3 flex items-center gap-2">
                {streaming && <Spinner />}
                <Trans>Tutor feedback</Trans>
              </Card.Heading>
              <Markdown isAnimating={streaming}>{feedback}</Markdown>
            </Card.Entry>
          )}
        </Card.List>
      </TopicContainer>

      <TopicActionBar>
        <Button className="ml-auto" onClick={() => void handleSubmit()} disabled={streaming || !!feedback}>
          <Trans>Submit reflection</Trans>
        </Button>
        <Button onClick={() => void handleComplete()} disabled={streaming || !feedback}>
          <Trans>Complete</Trans>
        </Button>
      </TopicActionBar>
    </>
  );
}
