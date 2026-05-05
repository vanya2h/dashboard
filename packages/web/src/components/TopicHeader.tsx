import { Button } from "@cloudflare/kumo/components/button";
import { Dialog } from "@cloudflare/kumo/components/dialog";
import { Text } from "@cloudflare/kumo/components/text";
import { Trans } from "@lingui/react/macro";

type Props = {
  taskTitle: string;
  curriculumName: string;
  onBack: () => void;
  onStartOver: () => void;
};

export function TopicHeader({ taskTitle, curriculumName, onBack, onStartOver }: Props) {
  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background">
      <Button size="sm" onClick={onBack}>
        <Trans>← Back</Trans>
      </Button>
      <div className="min-w-0">
        <Text variant="heading3" as="h1">
          {taskTitle}
        </Text>
        <p className="text-xs text-muted-foreground">{curriculumName}</p>
      </div>
      <div className="ml-auto shrink-0">
        <Dialog.Root>
          <Dialog.Trigger
            render={(p) => (
              <Button size="sm" {...p}>
                <Trans>Start over</Trans>
              </Button>
            )}
          />
          <Dialog size="sm" className="p-8">
            <div className="mb-4">
              <Dialog.Title className="text-xl font-semibold">
                <Trans>Start over?</Trans>
              </Dialog.Title>
            </div>
            <Dialog.Description className="text-muted-foreground">
              <Trans>Your current progress on this topic will be reset.</Trans>
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close
                render={(props) => (
                  <Button variant="secondary" {...props}>
                    <Trans>Cancel</Trans>
                  </Button>
                )}
              />
              <Dialog.Close
                render={(props) => (
                  <Button
                    variant="destructive"
                    {...props}
                    onClick={(e) => {
                      onStartOver();
                      props.onClick?.(e);
                    }}
                  >
                    <Trans>Start over</Trans>
                  </Button>
                )}
              />
            </div>
          </Dialog>
        </Dialog.Root>
      </div>
    </header>
  );
}
