"use strict";

import * as vscode from "vscode";
import * as cases from "change-case";

const changeCaseFuncs = {
  camelCase: cases.camelCase,
  "Capital Case": cases.capitalCase,
  CONST_CASE: cases.constantCase,
  "dot.case": cases.dotCase,
  "Header-Case": cases.headerCase,
  "no case": cases.noCase,
  "param-case": cases.paramCase,
  PascalCase: cases.pascalCase,
  "Sentence case": cases.sentenceCase,
  snake_case: cases.snakeCase,
};
type CaseName = keyof typeof changeCaseFuncs;
type CaseFunc = (typeof changeCaseFuncs)[CaseName];

export function changeCase() {
  if (vscode.window.activeTextEditor == null) return;
  const { document, selections } = vscode.window.activeTextEditor;
  const fileExt = document.fileName.substring(
    document.fileName.lastIndexOf(".") + 1,
    document.fileName.length
  );

  const config = vscode.workspace.getConfiguration("change-case");
  const caseNames: CaseName[] = config[fileExt] ?? config["default"] ?? [];
  const caseFuncs = caseNames
    .map((name) => changeCaseFuncs[name])
    .filter((func) => func != null);
  if (caseFuncs.length == 0) return;

  vscode.window.activeTextEditor.edit((editBuilder) => {
    selections.forEach((selection) => {
      if (!selection.isSingleLine) {
        return;
      }
      const range = selection.isEmpty
        ? document.getWordRangeAtPosition(selection.active)
        : selection;
      if (range == null) return;
      const text = document.getText(range);
      editBuilder.replace(range, changeWordCase(text, caseFuncs));
    });
  });
}

function changeWordCase(word: string, cases: CaseFunc[]): string {
  let nextCased: string | undefined;
  for (let index = cases.length - 1; index >= 0; index--) {
    const caseFunc = cases[index];

    const currCased = caseFunc(word);
    if (word === currCased) {
      return nextCased ?? cases[0](word);
    }
    nextCased = currCased;
  }
  return nextCased ?? cases[0](word);
}
