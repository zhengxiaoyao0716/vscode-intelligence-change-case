'use strict';

import * as vscode from 'vscode';

export function changeCase() {
    const { document, selections } = vscode.window.activeTextEditor;
    const fileName = vscode.window.activeTextEditor.document.fileName;
    const config = vscode.workspace.getConfiguration("change-case");
    const cases = config[fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length)] || config["default"];
    
    vscode.window.activeTextEditor.edit(editBuilder => {
        selections.forEach(selection => {
            if (!selection.isSingleLine) {
                return;
            }
            const range = new vscode.Range(selection.start, selection.end);
            if (!selection.isEmpty && selection.isSingleLine) {
                editBuilder.replace(selection, changeWordCase(document.getText(range), cases));
            }
        });
    });
}

const changeCaseFuncs = {
    "snake_case": require('snake-case'),
    "param-case": require('param-case'),
    "camelCase": require('camel-case'),
    "PascalCase": require('pascal-case'),
    "CONST_CASE": require('constant-case')
}

function changeWordCase(word: string, cases: string[]): string {
    let wordCases = [];
    cases.forEach(caseStr => {
        wordCases.push(changeCaseFuncs[caseStr](word));
    });
    for (let index = wordCases.length - 1; index >= 0; index--) {
        if (wordCases[index] == word) {
            return wordCases[index + 1] || wordCases[0];
        }
    }
    return wordCases[0];
}
