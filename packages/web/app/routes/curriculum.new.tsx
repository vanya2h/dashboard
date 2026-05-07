import { Trans } from "@lingui/react/macro";
import { CurriculumBuilder } from "../../src/components/CurriculumBuilder";
import type { BreadcrumbHandle } from "../../src/lib/breadcrumbs";
import type { Route } from "./+types/curriculum.new";

import { BreadcrumbItem, BreadcrumbPage } from "~/components/ui/breadcrumb";

export function meta(): Route.MetaDescriptors {
  return [
    { title: "New Program — Learning Tracker" },
    { name: "description", content: "Build a custom learning curriculum powered by AI." },
  ];
}

export const handle: BreadcrumbHandle = {
  breadcrumb: () => (
    <BreadcrumbItem>
      <BreadcrumbPage>
        <Trans>New program</Trans>
      </BreadcrumbPage>
    </BreadcrumbItem>
  ),
};

export default function NewCurriculumPage() {
  return <CurriculumBuilder />;
}
