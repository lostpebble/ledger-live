/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "tests/testUtils";
import { initialStateWalletSync } from "~/renderer/reducers/walletSync";
import { WalletSyncTestApp, mockedSdk } from "./shared";

jest.mock("../hooks/useTrustchainSdk", () => ({
  useTrustchainSdk: () => ({
    getMembers: (mockedSdk.getMembers = jest.fn()),
    removeMember: (mockedSdk.removeMember = jest.fn()),
    initMemberCredentials: (mockedSdk.initMemberCredentials = jest.fn()),
  }),
}));

describe("Rendering", () => {
  it("should loads and displays WalletSync Row", async () => {
    render(<WalletSyncTestApp />);
    expect(screen.getByRole("button", { name: "Manage" })).toBeTruthy();
  });

  it("should open drawer and display Wallet Sync Activation flow", async () => {
    const { user } = render(<WalletSyncTestApp />, {
      initialState: {
        walletSync: initialStateWalletSync,
      },
    });
    const button = screen.getByRole("button", { name: "Manage" });

    await user.click(button);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sync your accounts" })).toBeDefined(),
    );

    expect(screen.getByText("Already synced a Ledger Live app?")).toBeDefined();
  });
});
