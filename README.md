# YAML Ref Navigator

Enable jump-to-definition within YAML for references of style `${foo.bar}`.
This enables Ctrl+Click or F12 (or whatever other shortcut you have).

## Features

- Supports nested keys like `${foo.bar.baz}`
- Works across multiple YAML files in your workspace or open editors

<!-- > Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->
<!-- TODO: Add gif -->

**WARNING**: Developed using generative coding tools by an experienced developer who is trying TypeScript for the first time.
There are some tests, and nothing is ever modified, so the risk should be minimal; it might just not work.

## Usage

1. Install the extension
2. Open a `.yaml` file
3. Ctrl+Click on a `${foo.bar}` reference

## Example

```yaml
ref: ${foo.bar}

foo:
  bar: "Hello world!"
```

## Requirements

No external requirements besides `yaml` package.

## Extension Settings

<!-- 
Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.
- -->

No extension settings currently. Probably should support multiple reference types via regex.

## Known Issues

Probably terrible performance in large repos, as all YAML files keep getting parsed.

## Release Notes

### 0.1.0

Initial version.

---
<!-- 
## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!** -->
