// import { IGuidedDev } from '@sap-devx/guided-development-types';
import { ICollection, CollectionType, IItem, ActionType, IGuidedDevContribution } from './types/GuidedDev';
import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as path from 'path';
import { update } from 'lodash';

let changedCallback: (id: string) => void;
let changedCallbackThis: Object;
let collections: ICollection[] = getInitialCollections();
let items: IItem[] = getInitialItems();

function getInitialCollections(): ICollection[] {
    const collections: Array<ICollection> = [];
    let collection: ICollection = {
        id: "collection2",
        title: "Demo collection 2 [Platform]",
        description: "This is a demo collection. It contains self-contributed items and and an item contributed by a different contributor.",
        type: CollectionType.Platform,
        itemIds: [
            "saposs.vscode-contrib2.cfLogin",
            "saposs.vscode-contrib1.show-items"
        ]
    };
    collections.push(collection);

    return collections;
}

function getInitialItems(): IItem[] {
    const items: Array<IItem> = [];
    let item: IItem = {
        id: "cfLogin",
        title: "Cloud Foundry Login",
        description: "Login to Cloud Foundry (cf)",
        action: {
            name: "Login",
            type: ActionType.Execute,
            performAction: () => {
                return vscode.commands.executeCommand("workbench.action.openGlobalSettings");
            },
        },
        labels: []
    };
    items.push(item);

    item = {
        id: "show-items",
        title: "Show items",
        description: "Shows list of items",
        itemIds: [
            "saposs.vscode-contrib1.clone",
            // "saposs.vscode-contrib1.show-info"
        ],
        labels: [
            { "Project Name": "cap2" },
            { "Project Type": "CAP" },
            { "Path": "/home/user/projects/cap2" }
        ]
    };
    items.push(item);

    return items;
}

const fileNamesMap: Map<string, string> = new Map();

function updateCollectionsAndItems(): void {
    let collection: ICollection = {
        id: "collection3",
        title: "Demo collection 3",
        description: "This is another demo collection. It appears only after a file is created in the workspace",
        type: CollectionType.Platform,
        itemIds: []
    };

    items = [];
    for (const fileName of fileNamesMap.values()) {
        collection.itemIds.push(`saposs.vscode-contrib2.${fileName}`);
        let item: IItem = {
            id: fileName,
            title: fileName,
            description: fileName,
            action: {
                name: "Login",
                type: ActionType.Execute,
                performAction: () => {
                    return vscode.commands.executeCommand("workbench.action.openGlobalSettings");
                },
            },
            labels: []
        };
        items.push(item);
    }

    collections = [collection];
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vscode-contrib2" is now active!');

    const watcher = vscode.workspace.createFileSystemWatcher("**", false, true, false);
    watcher.onDidDelete((e) => {
        fileNamesMap.delete(e.fsPath);

        updateCollectionsAndItems();

        if (changedCallback) {
            changedCallback.call(changedCallbackThis, "saposs.vscode-contrib2");
        }
    });

    watcher.onDidCreate((e) => {
        if (vscode.workspace.rootPath) {
            if (e.fsPath.includes(vscode.workspace.rootPath)) {
                fileNamesMap.set(e.fsPath, path.basename(e.path));

                updateCollectionsAndItems();

                if (changedCallback) {
                    changedCallback.call(changedCallbackThis, "saposs.vscode-contrib2");
                }
            }
        }
    });

    const guidedDevContribution: IGuidedDevContribution = {
        // return items based on workspace folders/projects
        getCollections: () => {
            return collections;
        },
        getItems: () => {
            return items;
        },
        registerOnChangedCallback: (thisArg: Object, callback: (id: string) => void) => {
            changedCallbackThis = thisArg;
            changedCallback = callback;
        }
    }

    const api = {
        guidedDevContribution
    };

    return api;
}

export function deactivate() { }

// OPEN ISSUES:
//   Collection that reference items from other contributors:
//      Are those items necessarily not bound to a specific project?
//      Does that mean they are static?
//      No labels?
//      Constant item IDs?
