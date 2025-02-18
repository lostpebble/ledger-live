import test from "../../fixtures/common";
import { expect } from "@playwright/test";
import { ManagerPage } from "../../page/manager.page";
import { FirmwareUpdate } from "../../page/drawer/firmwareUpdate.drawer";
import { DeviceAction } from "../../models/DeviceAction";
import { Layout } from "../../component/layout.component";

test.use({ userdata: "skip-onboarding" });

// TODO Cover stax, figure out a good changelog and correct device info
// this e2e is only testing the very old firmware update path.
test("Firmware Update @smoke", async ({ page }) => {
  const managerPage = new ManagerPage(page);
  const firmwareUpdateDrawer = new FirmwareUpdate(page);
  const deviceAction = new DeviceAction(page);
  const layout = new Layout(page);

  await test.step("Access manager", async () => {
    await layout.goToManager();
    await deviceAction.accessManager();
    await managerPage.waitForFirmwareUpdateButton();
  });

  await test.step("Open firmware update modal", async () => {
    await managerPage.openFirmwareUpdateModal();
    // await expect.soft(firmwareUpdateModal.container).toHaveScreenshot("firmware-update-button.png");
  });

  await test.step("Firmware update changelog", async () => {
    // await expect.soft(firmwareUpdateModal.container).toHaveScreenshot("modal-checkbox.png");
  });

  await test.step("MCU download step", async () => {
    await firmwareUpdateDrawer.installUpdate();
    await firmwareUpdateDrawer.downloadProgress.waitFor({ state: "visible" });
    // await expect.soft(firmwareUpdateModal.container).toHaveScreenshot("download-mcu-progress.png");
  });

  await test.step("MCU flash step", async () => {
    await deviceAction.complete(); // .complete() install full firmware -> flash mcu
    await firmwareUpdateDrawer.flashProgress.waitFor({ state: "visible" });
    // await expect.soft(firmwareUpdateModal.container).toHaveScreenshot("flash-mcu-progress.png");
  });

  await test.step("Firmware update done", async () => {
    await deviceAction.complete(); // .complete() flash mcu -> completed
    await firmwareUpdateDrawer.waitForDeviceInfo(); // 2nd step to get the latest device info
    await firmwareUpdateDrawer.updateDone.waitFor({ state: "visible" });
    // await expect.soft(firmwareUpdateModal.container).toHaveScreenshot("flash-mcu-done.png");
  });

  await test.step("Modal is closed", async () => {
    // TODO rewrite this to fit a drawer model, not a modal one.
    await firmwareUpdateDrawer.drawerClose.click();
    await expect.soft(page).toHaveScreenshot("modal-closed.png");
  });
});
