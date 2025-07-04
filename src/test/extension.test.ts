import assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { findAllYamlDefinitions } from '../extension'; // Adjust path if needed


suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});


suite('YAML Ref Navigator Multi-File Tests', () => {
	const workspaceRoot = path.join(__dirname, 'workspace1');

	let doc1: vscode.TextDocument;
	let doc2: vscode.TextDocument;
	let doc3: vscode.TextDocument;

	suiteSetup(async () => {
		// Open the files as vscode documents
		doc1 = await vscode.workspace.openTextDocument(path.join(workspaceRoot, 'file1.yaml'));
		doc2 = await vscode.workspace.openTextDocument(path.join(workspaceRoot, 'file2.yaml'));
		doc3 = await vscode.workspace.openTextDocument(path.join(workspaceRoot, 'file3.yaml'));

		// Show documents in editor so they appear "open"
		await vscode.window.showTextDocument(doc1, { preview: false });
		await vscode.window.showTextDocument(doc3, { preview: false });
	});

	test('Find foo.bar in file1.yaml', async () => {
		const results = await findAllYamlDefinitions('foo.bar');
		assert.strictEqual(results.length, 1, 'Should find exactly one definition');
		assert.strictEqual(results[0].uri.fsPath, doc1.uri.fsPath, 'Definition should be in file1.yaml');
	});

	test('Find baz.qux in file2.yaml', async () => {
		const results = await findAllYamlDefinitions('baz.qux');
		assert.strictEqual(results.length, 1, 'Should find exactly one definition');
		assert.strictEqual(results[0].uri.fsPath, doc2.uri.fsPath, 'Definition should be in file2.yaml');
	});

	test('ref1 points to foo.bar', async () => {
		// Simulate providing definition at the position of "ref1" key
		const pos = doc1.getText().indexOf('${foo.bar}');
		const position = doc1.positionAt(pos);
		const locations = await vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeDefinitionProvider',
			doc1.uri,
			position
		);
		assert(locations && locations.length > 0, 'Should find definitions');
		assert.strictEqual(locations![0].uri.fsPath, doc1.uri.fsPath, 'Definition location should be in file1.yaml');
	});

	test('ref2 points to baz.qux', async () => {
		const pos = doc2.getText().indexOf('${baz.qux}');
		const position = doc2.positionAt(pos);
		const locations = await vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeDefinitionProvider',
			doc2.uri,
			position
		);
		assert(locations && locations.length > 0, 'Should find definitions');
		assert.strictEqual(locations![0].uri.fsPath, doc2.uri.fsPath, 'Definition location should be in file2.yaml');
	});

	test('ref3-to-1 points to foo.bar', async () => {
		const pos = doc3.getText().indexOf('${foo.bar}');
		const position = doc3.positionAt(pos);
		const locations = await vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeDefinitionProvider',
			doc3.uri,
			position
		);
		assert(locations && locations.length > 0, 'Should find definitions');
		assert.strictEqual(locations![0].uri.fsPath, doc1.uri.fsPath, 'Definition location should be in file1.yaml');
	});

	test('ref3-to-2 points to foo.bar', async () => {
		const pos = doc3.getText().indexOf('${baz.qux}');
		const position = doc3.positionAt(pos);
		const locations = await vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeDefinitionProvider',
			doc3.uri,
			position
		);
		assert(locations && locations.length > 0, 'Should find definitions');
		assert.strictEqual(locations![0].uri.fsPath, doc2.uri.fsPath, 'Definition location should be in file1.yaml');
	});
});