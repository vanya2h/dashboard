import { Trans } from "@lingui/react/macro";
import { useNavigate, useParams, useRouteLoaderData } from "react-router";
import { Inset } from "../../src/components/layout/Inset";
import { PageBody } from "../../src/components/layout/PageBody";
import { PageContent } from "../../src/components/layout/PageContent";
import { getCurriculumLinks } from "../../src/lib/routes";
import type { loader as layoutLoader } from "./topic-layout";

import { Card } from "~/components/Card";
import { ReadingColumn } from "~/components/layout/ReadingColumn";
import { Button } from "~/components/ui/button";

export default function CompletePage() {
  const layoutData = useRouteLoaderData<typeof layoutLoader>("routes/topic-layout");
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const navigate = useNavigate();

  const taskTitle = layoutData?.task.title ?? "";

  return (
    <PageBody>
      <PageContent>
        <ReadingColumn>
          <Card className="my-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              <Trans>Topic Complete!</Trans>
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              <Trans>
                You passed the final test for <span className="font-medium text-foreground">{taskTitle}</span>.
                It&apos;s been marked as done.
              </Trans>
            </p>
            <Button
              className="mt-6 ml-auto"
              onClick={() => curriculumId && void navigate(getCurriculumLinks().byId(curriculumId))}
            >
              <Trans>Continue</Trans>
            </Button>
          </Card>
        </ReadingColumn>
      </PageContent>
    </PageBody>
  );
}
