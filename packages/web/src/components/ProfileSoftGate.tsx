import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, SparkleIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { useRootData } from "../../app/hooks/useRootData";
import { getProfileRoute } from "../lib/routes";
import { Inset } from "./layout/Inset";

export function ProfileSoftGate() {
  const data = useRootData();

  if (!data?.user) return null;
  if (data.onboarding?.hasProfile) return null;

  return (
    <Link
      to={getProfileRoute()}
      className="group block border-b border-border bg-background text-sm text-foreground transition-colors"
    >
      <Inset className="flex items-center gap-3 py-3">
        <SparkleIcon size={16} className="shrink-0 text-green-400" />
        <p className="flex-1">
          <span className="font-medium">
            <Trans>Upload your CV for a tailored experience.</Trans>
          </span>{" "}
          <span className="text-muted-foreground hidden sm:inline">
            <Trans>Curriculums, assessments, and explanations all calibrate to what you already know.</Trans>
          </span>
        </p>
        <ArrowRightIcon
          size={14}
          className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      </Inset>
    </Link>
  );
}
