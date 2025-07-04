import assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { findAllYamlDefinitions } from '../../extension'; // Adjust path if needed


suite('YAML Ref Navigator Multi-Reference Tests (Workspace 2)', () => {
	const workspaceRoot = path.resolve(__dirname);
	let documents: Record<string, vscode.TextDocument> = {};

	suiteSetup(async () => {
		for (const file of ['conf.yaml', 'dev.yaml', 'prod.yaml']) {
			const fullPath = path.join(workspaceRoot, file);
			const doc = await vscode.workspace.openTextDocument(fullPath);
			await vscode.window.showTextDocument(doc, { preview: false });
			documents[file] = doc;
		}
	});

	// findAllYamlDefinitions

	const testCases = [
		{
			ref: 'flags.autoreload',
			expectedFiles: ['dev.yaml', 'prod.yaml'],
		},
		{
			ref: 'env',
			expectedFiles: ['dev.yaml', 'prod.yaml'],
		},
		{
			ref: 'default_env',
			expectedFiles: ['conf.yaml'],
		},
		{
			ref: 'commands.run',
			expectedFiles: ['conf.yaml'],
		},
		{
			ref: 'non.existing',
			expectedFiles: [],
		},
	];

	for (const { ref, expectedFiles } of testCases) {
		test(`findAllYamlDefinitions('${ref}') returns ${expectedFiles.length} result(s)`, async () => {
			const results = await findAllYamlDefinitions(ref);
			assert.strictEqual(results.length, expectedFiles.length, `Expected ${expectedFiles.length} results for ${ref}`);

			// Check all results point to expected files
			const resultFiles = results.map(loc => path.basename(loc.uri.fsPath));
			for (const expectedFile of expectedFiles) {
				assert(resultFiles.includes(expectedFile), `Expected result includes ${expectedFile}`);
			}
		});
	}
});
