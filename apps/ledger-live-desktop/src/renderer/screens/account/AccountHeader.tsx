import React, { useCallback, useState, useEffect } from "react";
import styled from "styled-components";
import {
  fontSize,
  color,
  ColorProps,
  FontSizeProps,
  FontWeightProps,
  SpaceProps,
} from "styled-system";
import fontFamily from "~/renderer/styles/styled/fontFamily";
import { Trans } from "react-i18next";
import { useDispatch } from "react-redux";
import { AccountLike, Account } from "@ledgerhq/types-live";
import {
  getDefaultExplorerView,
  getAccountContractExplorer,
} from "@ledgerhq/live-common/explorers";
import {
  getAccountCurrency,
  getMainAccount,
  shortAddressPreview,
} from "@ledgerhq/live-common/account/index";
import Box, { Tabbable } from "~/renderer/components/Box";
import Text from "~/renderer/components/Text";
import ExternalLink from "~/renderer/icons/ExternalLink";
import { openURL } from "~/renderer/linking";
import { colors } from "~/renderer/styles/theme";
import { rgba } from "~/renderer/styles/helpers";
import ParentCryptoCurrencyIcon from "~/renderer/components/ParentCryptoCurrencyIcon";
import IconPen from "~/renderer/icons/Pen";
import IconCross from "~/renderer/icons/Cross";
import IconCheck from "~/renderer/icons/Check";
import AccountTagDerivationMode from "~/renderer/components/AccountTagDerivationMode";
import { setAccountName } from "@ledgerhq/live-wallet/store";
import { useAccountName } from "~/renderer/reducers/wallet";

type BaseComponentProps = BaseProps & { ff?: string };

type BaseProps = {
  fontSize?: number;
  disableEllipsis?: boolean;
} & SpaceProps &
  ColorProps &
  FontSizeProps &
  FontWeightProps;

const CurName = styled(Text).attrs(() => ({
  ff: "Inter|SemiBold",
  fontSize: 2,
}))`
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
`;
const CurNameToken = styled(Text).attrs(() => ({
  ff: "Inter|Bold",
  fontSize: 2,
}))``;
const CurNameTokenLink = styled(CurNameToken)`
  margin-left: 5px;
  padding: 2px 4px;
  border-radius: ${p => p.theme.radii[1]}px;
`;
const CurNameTokenIcon = styled(Text).attrs(() => ({
  ff: "Inter|SemiBold",
  fontSize: 2,
}))`
  color: ${colors.wallet};
  display: none;
  margin-left: 5px;
  align-items: center;
`;
const Wrapper = styled(Box)`
  cursor: pointer;
  display: flex;
  align-items: center;

  :hover ${CurNameTokenIcon} {
    display: flex;
  }

  :hover ${CurNameTokenLink} {
    color: ${colors.wallet};
    background-color: ${colors.pillActiveBackground};
  }
`;
const AccountNameBox = styled(Box)`
  width: 100%;
  position: relative;
  left: -11px;
`;
const AccountName = styled.input.attrs<BaseProps>(p => ({
  fontSize: p.fontSize,
  color: p.color,
}))<BaseComponentProps>`
  ${fontFamily}
  ${fontSize}
  ${color}

  border: 1px solid;
  border-color: transparent;
  border-radius: 4px;
  padding: 1px 9px 2px;
  max-width: 350px !important;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  background-color: transparent;

  + svg {
    display: inline;
    opacity: 0;
    transition: opacity 0.2s;
  }

  :hover {
    border-color: ${p => (!p.disabled ? p.theme.colors.palette.text.shade30 : "transparent")};
    cursor: text;

    + svg {
      opacity: 1;
    }
  }

  :focus {
    border-color: ${p => p.theme.colors.wallet};
    background: ${p => (p.theme.colors.palette.type === "light" ? "#fff" : "none")};

    + svg {
      display: none;
    }
  }
`;
const IconButton = styled(Tabbable).attrs(() => ({
  alignItems: "center",
  justifyContent: "center",
}))`
  width: 34px;
  height: 34px;
  border: 1px solid ${p => p.theme.colors.palette.text.shade60};
  border-radius: 4px;
  &:hover {
    color: ${p => (p.disabled ? "" : p.theme.colors.palette.text.shade100)};
    background: ${p => (p.disabled ? "" : rgba(p.theme.colors.palette.divider, 0.2))};
    border-color: ${p => p.theme.colors.palette.text.shade100};
  }

  &:active {
    background: ${p => (p.disabled ? "" : rgba(p.theme.colors.palette.divider, 0.3))};
  }
`;

type Props = {
  account: AccountLike;
  parentAccount: Account | undefined | null;
};

const AccountHeader: React.ComponentType<Props> = React.memo(function AccountHeader({
  account,
  parentAccount,
}: Props) {
  const dispatch = useDispatch();
  const storeAccountName = useAccountName(account);
  // local state of the name
  const [name, setName] = useState(storeAccountName);
  const [editingName, setEditingName] = useState(false);
  const currency = getAccountCurrency(account);
  const mainAccount = getMainAccount(account, parentAccount);
  const explorerView = getDefaultExplorerView(mainAccount.currency);
  const getContract = () =>
    account.type === "TokenAccount" && parentAccount
      ? getAccountContractExplorer(explorerView, account, parentAccount)
      : null;
  const submitNameChange = () => {
    if (account.type === "Account") {
      dispatch(setAccountName(account.id, name));
    }
  };

  const submitNameChangeOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
      submitNameChange();
    }
  };
  const contract = getContract();
  const openLink = useCallback(() => {
    if (contract) {
      openURL(contract);
    }
  }, [contract]);
  useEffect(() => {
    if (!editingName) {
      setName(storeAccountName);
    }
  }, [editingName, storeAccountName]);
  return (
    <Box horizontal shrink alignItems="center" flow={3}>
      <Box>
        <ParentCryptoCurrencyIcon currency={currency} bigger />
      </Box>
      <Box
        style={{
          alignItems: "flex-start",
          flex: 1,
        }}
      >
        {contract && account.type === "TokenAccount" ? (
          <Box horizontal alignItems="center">
            <CurNameToken>
              <Trans i18nKey="account.contractAddress" />
            </CurNameToken>
            <Wrapper horizontal alignItems="center" onClick={openLink}>
              <CurNameTokenLink>
                {shortAddressPreview(account.token.contractAddress)}
              </CurNameTokenLink>
              <CurNameTokenIcon>
                <Box mr={5}>
                  <ExternalLink size={12} />
                </Box>
                <Trans i18nKey="account.openInExplorer" />
              </CurNameTokenIcon>
            </Wrapper>
          </Box>
        ) : (
          <CurName>
            {currency.name} <AccountTagDerivationMode account={account} />
          </CurName>
        )}
        <AccountNameBox horizontal alignItems="center" flow={2}>
          <AccountName
            color="palette.text.shade100"
            disabled={account.type !== "Account"}
            ff="Inter|SemiBold"
            fontSize={7}
            onFocus={() => {
              setEditingName(true);
              setTimeout(() => {
                document.execCommand("selectAll", false, undefined);
              });
            }}
            onBlur={() => {
              setEditingName(false);
              setTimeout(() => {
                window.getSelection()?.removeAllRanges();
              });
            }}
            onKeyPress={submitNameChangeOnEnter}
            onChange={e => setName(e.target.value)}
            disableEllipsis={editingName}
            value={name}
            id="account-header-name"
            data-testid="account-header-name"
          />
          {account.type === "Account" && (
            <>
              <IconPen size={14} />
              {editingName && (
                <>
                  <IconButton>
                    <Box justifyContent="center">
                      <IconCross size={16} />
                    </Box>
                  </IconButton>
                  <IconButton onMouseDown={submitNameChange}>
                    <Box justifyContent="center" color="positiveGreen">
                      <IconCheck size={16} />
                    </Box>
                  </IconButton>
                </>
              )}
            </>
          )}
        </AccountNameBox>
      </Box>
    </Box>
  );
});

export default AccountHeader;
