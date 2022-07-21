// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Node, Project, SourceFile, ts } from 'ts-morph';

import { ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, workspace, window, commands, Disposable } from 'vscode';

import type { ExtensionContext } from 'vscode';

class TreeNode extends TreeItem {
  constructor(label: string, collapsibleState: TreeItemCollapsibleState) {
    super(label, collapsibleState);
  }
}

class TreeProvider implements TreeDataProvider<Node<ts.Node>> {
  constructor(private root: SourceFile) {}

  getTreeItem(element: Node<ts.Node>): TreeItem | Thenable<TreeItem> {
    return new TreeNode(element.getKindName(), TreeItemCollapsibleState.Expanded);
  }

  getChildren(element?: Node<ts.Node> | undefined): ProviderResult<Node<ts.Node>[]> {
    if (element === undefined) {
      return [this.root];
    }

    return element.getChildren();
  }
}

const countNodes = (root: Node<ts.Node>): number => {
  let total = 1;

  root.forEachChild((child: Node<ts.Node>) => {
    total += countNodes(child);
  });

  return total;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  console.log('Activated the extension');

  const project = new Project({ useInMemoryFileSystem: true });

  let sourceFile: SourceFile | undefined;
  let tree: Disposable | undefined;

  const saveEvent = workspace.onDidSaveTextDocument(async (file) => {
    sourceFile = project.createSourceFile('__temp__.ts', file.getText());
  });

  const countNodesCommand = commands.registerCommand('countNodes', () => {
    if (!sourceFile) {
      return;
    }

    const nodeCount = countNodes(sourceFile);

    window.showInformationMessage(`There is ${nodeCount} nodes in the abstract syntax tree.`);
  });

  const openTreeCommand = commands.registerCommand('openTree', () => {
    if (!sourceFile || tree) {
      return;
    }

    tree = window.registerTreeDataProvider('seeTree', new TreeProvider(sourceFile));
    context.subscriptions.push(tree);
  });

  context.subscriptions.push(saveEvent, openTreeCommand, countNodesCommand);
}

export function deactivate() {}
