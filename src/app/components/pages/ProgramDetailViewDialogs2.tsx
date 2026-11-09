// @ts-nocheck
import { ProgramDetailViewDialogs2A } from "./ProgramDetailViewDialogs2A";
import { ProgramDetailViewDialogs2B } from "./ProgramDetailViewDialogs2B";

interface ProgramDetailViewDialogsProps {
  [key: string]: any;
}

export function ProgramDetailViewDialogs2(
  props: ProgramDetailViewDialogsProps,
) {
  return (
    <>
      <ProgramDetailViewDialogs2A {...props} />
      <ProgramDetailViewDialogs2B {...props} />
    </>
  );
}
