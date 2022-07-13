#!/usr/bin/env zx
import "zx/globals";

const basePath = path.join(__dirname, "..");
const rendererPath = path.join(basePath, "src", "renderer");
const generatedPath = path.join(rendererPath, "generated");

await fs.promises.rm(generatedPath, { recursive: true, force: true });
await fs.promises.mkdir(generatedPath);

const families = await fs.readdir(path.join(rendererPath, "families"));
const targets = [
  "operationDetails.jsx",
  "operationDetails.js",
  "accountActions.jsx",
  "TransactionConfirmFields.jsx",
  "AccountBodyHeader.js",
  "AccountSubHeader.jsx",
  "SendAmountFields.jsx",
  "SendRecipientFields.jsx",
  "SendWarning.js",
  "ReceiveWarning.jsx",
  "AccountBalanceSummaryFooter.jsx",
  "TokenList.jsx",
  "AccountHeaderManageActions.js",
  "StepReceiveFunds.jsx",
  "NoAssociatedAccounts.jsx",
];

async function genTarget(target) {
  let imports = `// @flow`;
  let exprts = `export default {`;
  const outpath = path.join(generatedPath, target);

  for (const family of families) {
    const p = path.join(rendererPath, "families", family, target);
    const exists = await fs.exists(path.join(rendererPath, "families", family, target));
    if (exists) {
      imports += `
import ${family} from "../families/${family}/${target}";`;
      exprts += `
  ${family},`;
    }
  }

  exprts += `
};
`;

  const str = `${imports}

${exprts}`;

  await fs.promises.writeFile(outpath, str, "utf8");
}

targets.map(genTarget);
