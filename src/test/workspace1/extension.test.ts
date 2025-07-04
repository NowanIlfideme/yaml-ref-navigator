import assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { findAllYamlDefinitions } from '../../extension'; // Adjust path if needed


suite('YAML Ref Navigator Multi-File Tests (Workspace 1)', () => {
	const workspaceRoot = path.resolve(__dirname);
	let documents: Record<string, vscode.TextDocument> = {};


	suiteSetup(async () => {
		for (const file of ['file1.yaml', 'file2.yaml', 'file3.yaml']) {
			const fullPath = path.join(workspaceRoot, file);
			const doc = await vscode.workspace.openTextDocument(fullPath);
			await vscode.window.showTextDocument(doc, { preview: false });
			documents[file] = doc;
		}
	});

	// findAllYamlDefinitions

	const definitionTests = [
		{ ref: 'foo.bar', expectedFile: 'file1.yaml' },
		{ ref: 'baz.qux', expectedFile: 'file2.yaml' },
		{ ref: 'no.such.key', expectedFile: null }, // negative test
	];

	definitionTests.forEach(({ ref, expectedFile }) => {
		const label = expectedFile
			? `findAllYamlDefinitions: ${ref} → ${expectedFile}`
			: `findAllYamlDefinitions: ${ref} → no match`;

		test(label, async () => {
			const results = await findAllYamlDefinitions(ref);
			if (expectedFile) {
				assert.strictEqual(results.length, 1, 'Should find exactly one definition');
				assert(results[0].uri.fsPath.endsWith(expectedFile), `Expected match in ${expectedFile}`);
			} else {
				assert.strictEqual(results.length, 0, 'Should return no matches');
			}
		});
	});

	// definition provider

	const definitionProviderTests = [
		{ file: 'file1.yaml', refText: '${foo.bar}', expectedFile: 'file1.yaml' },
		{ file: 'file2.yaml', refText: '${baz.qux}', expectedFile: 'file2.yaml' },
		{ file: 'file3.yaml', refText: '${foo}', expectedFile: 'file1.yaml' },
		{ file: 'file3.yaml', refText: '${baz.qux}', expectedFile: 'file2.yaml' },
		{ file: 'file3.yaml', refText: '${no.such.key}', expectedFile: null },
	];

	definitionProviderTests.forEach(({ file, refText, expectedFile }) => {
		const label = expectedFile
			? `DefinitionProvider: ${refText} in ${file} → ${expectedFile}`
			: `DefinitionProvider: ${refText} in ${file} → no match`;

		test(label, async () => {
			const doc = documents[file];
			const offset = doc.getText().indexOf(refText);
			assert(offset !== -1, `Reference text "${refText}" not found in ${file}`);
			const cursorPosition = doc.positionAt(offset);

			const locations = await vscode.commands.executeCommand<vscode.Location[]>(
				'vscode.executeDefinitionProvider',
				doc.uri,
				cursorPosition
			);

			if (expectedFile) {
				assert(locations && locations.length > 0, 'Expected definition(s)');
				assert(locations!.some(loc => loc.uri.fsPath.endsWith(expectedFile)),
					`Expected a definition in ${expectedFile}`);
			} else {
				assert(!locations || locations.length === 0, 'Expected no definitions');
			}
		});
	});
});


suite('YAML Ref Navigator Multi-Pattern Tests (Workspace 1)', () => {
	const workspaceRoot = path.resolve(__dirname);
	let doc: vscode.TextDocument;

	suiteSetup(async () => {
		// REMOVEME: Testing stuff
		console.log('Workspace folders:', vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath));
		const cfg = vscode.workspace.getConfiguration('yamlRefNavigator');
		console.log('Reference patterns:', cfg.get('referencePatterns'));

		// Manual override
		const config = vscode.workspace.getConfiguration();
		await config.update(
			'yamlRefNavigator.referencePatterns',
			['\\$\\{([a-zA-Z0-9_\\-.]+)\\}', '<<([a-zA-Z0-9_.:]+)>>'],
			vscode.ConfigurationTarget.Workspace // or ConfigurationTarget.Global for global
		);

		// Read
		doc = await vscode.workspace.openTextDocument(path.join(workspaceRoot, 'file-multi-pattern.yaml'));
		await vscode.window.showTextDocument(doc, { preview: false });
	});

	const testCases = [
		{ pattern: '${foo.bar}', expectedFile: 'file1.yaml', description: 'Dollar brace pattern' },
		{ pattern: '<<baz.qux>>', expectedFile: 'file2.yaml', description: 'Angle bracket pattern' },
	];

	for (const { pattern, expectedFile, description } of testCases) {
		test(`Find reference using ${description}`, async () => {
			const pos = doc.getText().indexOf(pattern);
			assert.notStrictEqual(pos, -1, `Reference pattern ${pattern} not found in test file`);
			const position = doc.positionAt(pos);
			const locations = await vscode.commands.executeCommand<vscode.Location[]>(
				'vscode.executeDefinitionProvider',
				doc.uri,
				position
			);
			assert(locations && locations.length > 0, `Should find definitions for ${pattern}`);
			assert(
				locations.some(loc => loc.uri.fsPath.endsWith(expectedFile)),
				`Definition should be in ${expectedFile}`
			);
		});
	}
});
