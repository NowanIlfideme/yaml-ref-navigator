import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
	{
		files: 'out/test/workspace1/**/*.test.js',
		workspaceFolder: 'src/test/workspace1'
	},
	{
		files: 'out/test/workspace2/**/*.test.js',
		workspaceFolder: 'src/test/workspace2'
	}
]);
