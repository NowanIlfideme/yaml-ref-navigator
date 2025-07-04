// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { parseDocument, LineCounter, isMap, isNode } from 'yaml';  // npm install yaml

function findMatchingKeys(obj: any, lineCounter: LineCounter): Map<string, vscode.Position> {
	const result = new Map<string, vscode.Position>();

	function walk(node: any, path: string[] = []) {
		if (isMap(node)) {
			for (const item of node.items) {
				const keyNode = item.key;
				const valueNode = item.value;

				if (!isNode(keyNode)) { continue; }

				const key = keyNode.toString();
				const newPath = [...path, key];
				const fullPath = newPath.join('.');

				// Get line/column using lineCounter
				if (keyNode.range) {
					const pos = lineCounter.linePos(keyNode.range[0]);
					// NOTE: pos for yaml is 1-based, while vscode.Position is 0-based
					result.set(fullPath, new vscode.Position(pos.line - 1, pos.col - 1));
				}

				walk(valueNode, newPath);
			}
		}
	}

	walk(obj.contents);
	return result;
}



export async function findYamlDefinitionInFile(refText: string, uri: vscode.Uri, content: string): Promise<vscode.Location[]> {
	const yamlVersion = vscode.workspace
		.getConfiguration('yamlRefNavigator')
		.get<'1.1' | '1.2' | 'next'>('yamlVersion', '1.2');

	const lineCounter = new LineCounter();
	const doc = parseDocument(content, { version: yamlVersion, lineCounter });

	const keyMap = findMatchingKeys(doc, lineCounter);
	const position = keyMap.get(refText);

	if (position) {
		return [new vscode.Location(uri, position)];
	}

	return [];
}

export async function findAllYamlDefinitions(refText: string): Promise<vscode.Location[]> {
	const results: vscode.Location[] = [];

	// 1. Search open documents
	for (const doc of vscode.workspace.textDocuments) {
		if (!doc.fileName.endsWith('.yaml') && !doc.fileName.endsWith('.yml')) { continue; }
		const matches = await findYamlDefinitionInFile(refText, doc.uri, doc.getText());
		results.push(...matches);
	}

	// 2. Search YAML files in workspace (skip already-open ones)
	const files = await vscode.workspace.findFiles('**/*.y?(a)ml');
	const openPaths = new Set(vscode.workspace.textDocuments.map(doc => doc.uri.fsPath));

	for (const file of files) {
		if (openPaths.has(file.fsPath)) { continue; } // skip duplicates
		const content = fs.readFileSync(file.fsPath, 'utf-8');
		const matches = await findYamlDefinitionInFile(refText, file, content);
		results.push(...matches);
	}

	return results;
}


class ReferenceDefinitionProvider implements vscode.DefinitionProvider {
	async provideDefinition(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
	): Promise<vscode.Definition | null> {
		const patternStrings: string[] = vscode.workspace.getConfiguration('yamlRefNavigator').get('referencePatterns') || [];

		for (const pattern of patternStrings) {
			const rangeRegex = new RegExp(pattern);

			// Auto-anchor for matchRegex
			const isAnchored = pattern.startsWith('^') || pattern.endsWith('$');
			const matchRegex = new RegExp(isAnchored ? pattern : `^${pattern}$`);

			const wordRange = document.getWordRangeAtPosition(position, rangeRegex);
			if (!wordRange) { continue; }

			const word = document.getText(wordRange);
			const match = word.match(matchRegex);
			if (!match || !match[1]) { continue; }

			const refText = match[1];

			if (vscode.workspace.getConfiguration('yamlRefNavigator').get('debug')) {
				vscode.window.showInformationMessage(`🔍 Found reference: ${refText}`);
			}

			const locations = await findAllYamlDefinitions(refText);
			if (locations.length) { return locations; }
		}
		return null;

		// // Figure out if we have a definition here
		// const rangeRegex = /\$\{([a-zA-Z0-9_.:]+)\}/;
		// const matchRegex = /^\$\{([a-zA-Z0-9_.:]+)\}$/;

		// const wordRange = document.getWordRangeAtPosition(position, rangeRegex);
		// if (!wordRange) { return null; }
		// const match = document.getText(wordRange).match(matchRegex);
		// if (!match) { return null; }
		// const refText = match[1];

		// // Mostly used for development
		// if (vscode.workspace.getConfiguration('yamlRefNavigator').get('debug')) {
		// 	vscode.window.showInformationMessage(`🔍 Looking for definition of "${refText}"`);
		// }

		// const locations = await findAllYamlDefinitions(refText);
		// return locations.length ? locations : null;
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('✅ YAML Ref Navigator activated');

	context.subscriptions.push(
		vscode.languages.registerDefinitionProvider(
			{ language: 'yaml', scheme: 'file' },
			new ReferenceDefinitionProvider()
		)
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
