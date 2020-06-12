// @flow
import React, { useCallback } from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import {
  getDefaultExplorerView,
  getAddressExplorer,
} from "@ledgerhq/live-common/lib/explorers";
import type {
  Account,
  OperationType,
  Operation,
} from "@ledgerhq/live-common/lib/types";
import {
  useMappedExtraOperationDetails,
  useCosmosPreloadData,
} from "@ledgerhq/live-common/lib/families/cosmos/react";
import { formatCurrencyUnit } from "@ledgerhq/live-common/lib/currencies/formatCurrencyUnit";
import { BigNumber } from "bignumber.js";
import { getAccountUnit } from "@ledgerhq/live-common/lib/account/helpers";

import type {
  CosmosExtraTxInfo,
  CosmosMappedDelegationInfo,
} from "@ledgerhq/live-common/lib/families/cosmos/types";
import DelegationInfo from "../../components/DelegationInfo";
import Section from "../../screens/OperationDetails/Section";
import { urls } from "../../config/urls";

function getURLFeesInfo(op: Operation): ?string {
  return op.fee.gt(200000) ? urls.cosmosStakingRewards : undefined;
}

function getURLWhatIsThis(op: Operation): ?string {
  return op.type !== "IN" && op.type !== "OUT"
    ? urls.cosmosStakingRewards
    : undefined;
}

type Props = {
  extra: CosmosExtraTxInfo,
  type: OperationType,
  account: Account,
};

function OperationDetailsExtra({ extra, type, account }: Props) {
  const { t } = useTranslation();
  const unit = getAccountUnit(account);
  const { validators: cosmosValidators } = useCosmosPreloadData();
  const mappedExtra = useMappedExtraOperationDetails({
    extra,
    account,
  });

  let ret = null;

  switch (type) {
    case "DELEGATE":
      ret = mappedExtra && (
        <OperationDetailsValidators
          account={account}
          delegations={mappedExtra.validators}
        />
      );
      break;

    case "UNDELEGATE": {
      const { validators } = extra;
      if (!validators || validators.length <= 0) return null;

      const validator = extra.validators[0];

      const formattedValidator = cosmosValidators.find(
        v => v.validatorAddress === validator.address,
      );

      const formattedAmount = formatCurrencyUnit(
        unit,
        BigNumber(validator.amount),
        {
          disableRounding: true,
          alwaysShowSign: false,
          showCode: true,
        },
      );

      ret = (
        <>
          <Section
            title={t("operationDetails.extra.undelegatedFrom")}
            value={
              formattedValidator?.name ?? formattedValidator.validatorAddress
            }
          />
          <Section
            title={t("operationDetails.extra.undelegatedAmount")}
            value={formattedAmount}
          />
        </>
      );
      break;
    }
    case "REDELEGATE": {
      const { cosmosSourceValidator, validators } = extra;
      if (!validators || validators.length <= 0 || !cosmosSourceValidator)
        return null;

      const validator = extra.validators[0];

      const formattedValidator = cosmosValidators.find(
        v => v.validatorAddress === validator.address,
      );

      const formattedSourceValidator = cosmosValidators.find(
        v => v.validatorAddress === cosmosSourceValidator,
      );

      const formattedAmount = formatCurrencyUnit(
        unit,
        BigNumber(validator.amount),
        {
          disableRounding: true,
          alwaysShowSign: false,
          showCode: true,
        },
      );

      ret = (
        <>
          <Section
            title={t("operationDetails.extra.redelegatedFrom")}
            value={
              formattedSourceValidator
                ? formattedSourceValidator.name
                : cosmosSourceValidator
            }
          />
          <Section
            title={t("operationDetails.extra.redelegatedTo")}
            value={
              formattedValidator ? formattedValidator.name : validator.address
            }
          />
          <Section
            title={t("operationDetails.extra.redelegatedAmount")}
            value={formattedAmount}
          />
        </>
      );
      break;
    }
    case "REWARD": {
      const { validators } = extra;
      if (!validators || validators.length <= 0) return null;

      const validator = extra.validators[0];

      const formattedValidator = cosmosValidators.find(
        v => v.validatorAddress === validator.address,
      );

      const formattedAmount = formatCurrencyUnit(
        unit,
        BigNumber(validator.amount),
        {
          disableRounding: true,
          alwaysShowSign: false,
          showCode: true,
        },
      );

      ret = (
        <>
          <Section
            title={t("operationDetails.extra.rewardFrom")}
            value={
              formattedValidator?.name ?? formattedValidator.validatorAddress
            }
          />
          <Section
            title={t("operationDetails.extra.rewardAmount")}
            value={formattedAmount}
          />
        </>
      );
      break;
    }
    default:
      break;
  }

  return (
    <>
      {ret}
      {extra.memo && (
        <Section title={t("operationDetails.extra.memo")} value={extra.memo} />
      )}
    </>
  );
}

export default {
  getURLFeesInfo,
  getURLWhatIsThis,
  OperationDetailsExtra,
};

type OperationDetailsValidatorsProps = {
  account: Account,
  delegations: CosmosMappedDelegationInfo[],
};

function OperationDetailsValidators({
  account,
  delegations,
}: OperationDetailsValidatorsProps) {
  const { t } = useTranslation();

  const redirectAddressCreator = useCallback(
    address => () => {
      const url = getAddressExplorer(
        getDefaultExplorerView(account.currency),
        address,
      );
      if (url) Linking.openURL(url);
    },
    [account],
  );

  return (
    <Section
      title={t("operationDetails.extra.validators", {
        number: delegations.length,
      })}
    >
      {delegations.map(({ address, validator, formattedAmount }, i) => (
        <DelegationInfo
          key={address + i}
          address={address}
          name={validator?.name ?? address}
          formattedAmount={formattedAmount}
          onPress={redirectAddressCreator(address)}
        />
      ))}
    </Section>
  );
}
