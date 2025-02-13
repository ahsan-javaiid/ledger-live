import React from "react";
import { Box, InfiniteLoader } from "@ledgerhq/native-ui";

export default function LoadingIndicator() {
  return (
    <Box height={40} pt={4} accessible accessibilityRole="progressbar">
      <InfiniteLoader size={30} />
    </Box>
  );
}
