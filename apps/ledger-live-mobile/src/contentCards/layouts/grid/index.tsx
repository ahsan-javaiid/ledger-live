import React from "react";
import { useWindowDimensions } from "react-native";
import { ContentLayoutBuilder } from "~/contentCards/layouts/utils";
import { Flex } from "@ledgerhq/native-ui";
import { WidthFactor } from "~/contentCards/layouts/types";
import { useItemStyle as getItemStyle } from "./utils";
import { ContentCardsType } from "~/dynamicContent/types";

type Props = {
  styles?: {
    gap?: number;
    widthFactor?: WidthFactor;
  };
};

const defaultStyles = {
  gap: 16,
  widthFactor: WidthFactor.Half,
};

const Grid = ContentLayoutBuilder<Props>(({ items, styles: _styles = defaultStyles }) => {
  const { width: windowWidth } = useWindowDimensions();
  const styles = {
    gap: _styles.gap ?? defaultStyles.gap,
    widthFactor: _styles.widthFactor ?? defaultStyles.widthFactor,
  };
  const cardWidth =
    styles.widthFactor === WidthFactor.Full
      ? windowWidth * styles.widthFactor - styles.gap * 2
      : windowWidth * styles.widthFactor - styles.gap * 1.5;
  const isStack =
    styles.widthFactor === WidthFactor.Full && items[0].props.type === ContentCardsType.action;

  return (
    <Flex
      style={{
        marginHorizontal: styles.gap,
        justifyContent: "flex-start",
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: isStack ? 0 : styles.gap,
      }}
    >
      {items.map((item, index) => {
        return (
          <Flex key={item.props.metadata.id} style={{ width: cardWidth }}>
            <item.component
              {...item.props}
              itemStyle={getItemStyle(items.length === 1, index === 0, index === items.length - 1)}
            />
          </Flex>
        );
      })}
    </Flex>
  );
});

export default Grid;
