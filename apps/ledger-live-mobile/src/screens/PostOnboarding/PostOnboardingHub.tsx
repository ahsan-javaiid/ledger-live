import React, { useCallback, useEffect } from "react";
import { Divider, Flex, Text, Button } from "@ledgerhq/native-ui";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useAllPostOnboardingActionsCompleted,
  usePostOnboardingHubState,
} from "@ledgerhq/live-common/postOnboarding/hooks/index";
import { clearPostOnboardingLastActionCompleted } from "@ledgerhq/live-common/postOnboarding/actions";
import { useDispatch } from "react-redux";
import { getDeviceModel } from "@ledgerhq/devices";
import { DeviceModelId } from "@ledgerhq/types-devices";
import PostOnboardingActionRow from "~/components/PostOnboarding/PostOnboardingActionRow";
import { TrackScreen } from "~/analytics";
import Link from "~/components/wrappedUi/Link";
import { useCompletePostOnboarding } from "~/logic/postOnboarding/useCompletePostOnboarding";
const PostOnboardingHub = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { actionsState, deviceModelId } = usePostOnboardingHubState();
  const closePostOnboarding = useCompletePostOnboarding();

  const clearLastActionCompleted = useCallback(() => {
    dispatch(clearPostOnboardingLastActionCompleted());
  }, [dispatch]);

  useEffect(
    /**
     * The last action context (specific title & popup) should only be visible
     * the 1st time the hub is navigated to after that action was completed.
     * So here we clear the last action completed.
     * */
    () => clearLastActionCompleted,
    [clearLastActionCompleted],
  );

  const navigateToMainScreen = useCallback(() => {
    closePostOnboarding();
  }, [closePostOnboarding]);

  const safeAreaInsets = useSafeAreaInsets();
  const allDone = useAllPostOnboardingActionsCompleted() || !deviceModelId;

  if (!deviceModelId) return null; // this will never happen in practice

  const productName = getDeviceModel(deviceModelId).productName;
  return (
    <>
      <TrackScreen
        key={allDone.toString()}
        category={
          allDone ? "User has completed all post-onboarding actions" : "Post-onboarding hub"
        }
      />
      <Flex
        px={6}
        py={7}
        justifyContent="space-between"
        flex={1}
        paddingBottom={safeAreaInsets.bottom}
      >
        <Flex>
          <Flex pb={8}>
            <Text variant="h1Inter" fontWeight="semiBold">
              {allDone
                ? t("postOnboarding.hub.allDoneTitle", {
                    productName,
                  })
                : t("postOnboarding.hub.title", { productName })}
            </Text>
          </Flex>
          <ScrollView>
            {actionsState.map((action, index, arr) => (
              <React.Fragment key={index}>
                <PostOnboardingActionRow {...action} deviceModelId={deviceModelId} />
                {index !== arr.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </ScrollView>
        </Flex>
        <Flex my={7} alignItems="center" justifyContent="center">
          {allDone ? (
            <Button
              alignSelf="stretch"
              size="large"
              type="main"
              outline={false}
              onPress={navigateToMainScreen}
            >
              {t("postOnboarding.hub.viewWallet")}
            </Button>
          ) : (
            <Link
              size="large"
              onPress={navigateToMainScreen}
              event="button_clicked"
              eventProperties={{ button: "I'll do this later" }}
            >
              {t("postOnboarding.hub.skip")}
            </Link>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default PostOnboardingHub;
