import React from "react";

import { Transaction as ICPTransaction } from "@ledgerhq/live-common/families/internet_computer/types";
import type { MemoTagInputProps } from "LLM/features/MemoTag/types";
import { GenericMemoTagInput } from "LLM/features/MemoTag/components/GenericMemoTagInput";

export default (props: MemoTagInputProps) => (
  <GenericMemoTagInput<ICPTransaction>
    {...props}
    textToValue={text => text.replace(/\D/g, "")}
    valueToTxPatch={value => ({ memo: value || undefined })}
  />
);
