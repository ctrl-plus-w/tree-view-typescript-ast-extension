// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Node, Project, SourceFile, ts } from 'ts-morph';

import { TreeItem, window, TreeDataProvider, TreeItemCollapsibleState, commands, ProviderResult, workspace, Disposable } from 'vscode';

import type { ExtensionContext } from 'vscode';

const parse = (node: Node<ts.Node>, indent = 0) => {
  console.log(`${Array(indent).fill(' ').join('')}${node.getKindName()}`);
  node.forEachChild((child) => parse(child, indent + 2));
};

class TreeNode extends TreeItem {
  constructor(label: string, collapsibleState: TreeItemCollapsibleState) {
    super(label, collapsibleState);
  }
}

class TreeProvider implements TreeDataProvider<Node<ts.Node>> {
  constructor(private sourceNode: Node<ts.Node>) {}

  getTreeItem(element: Node<ts.Node>): TreeItem | Thenable<TreeItem> {
    return new TreeNode(element.getKindName(), TreeItemCollapsibleState.Expanded);
  }

  getChildren(element?: Node<ts.Node> | undefined): ProviderResult<Node<ts.Node>[]> {
    if (element === undefined) {
      return [this.sourceNode];
    }

    return element.getChildren();
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  console.log('Activated the extension');

  const project = new Project({
    useInMemoryFileSystem: true,
  });

  let sourceFile: SourceFile | undefined;
  let tree: Disposable | undefined;

  const saveEvent = workspace.onDidSaveTextDocument(async (file) => {
    sourceFile = project.createSourceFile('__temp__.ts', file.getText());
  });

  const helloWorldCommand = commands.registerCommand('demo.helloWorld', () => {
    console.log('Hello World command called !');

    if (sourceFile && !tree) {
      tree = window.registerTreeDataProvider('seeTree', new TreeProvider(sourceFile));
      context.subscriptions.push(tree);
    }
  });

  // context.subscriptions.push(saveEvent, helloWorldCommand);
  context.subscriptions.push(saveEvent, helloWorldCommand);
}

export function deactivate() {}

function getWebviewContent() {
  return `
	<!DOCTYPE html>
  <html lang="en">
		<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Cat Coding</title>
		</head>
		<body>
				<img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
		</body>
	</html>
	`;
}
