// import { IGuidedDev } from '@sap-devx/guided-development-types';
import { ICollection, CollectionType, IItem, ActionType, IGuidedDevContribution } from './types/GuidedDev';
import * as vscode from 'vscode';
import * as _ from 'lodash';

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
            "SAPOSS.vscode-contrib2.cfLogin",
            "SAPOSS.vscode-contrib1.show-items"
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
            "SAPOSS.vscode-contrib1.clone",
            "SAPOSS.vscode-contrib1.show-info"
        ],
        labels: [
            {"Project Name": "cap2"},
            {"Project Type": "CAP"},
            {"Path": "/home/user/projects/cap2"}
        ]
    };
    items.push(item);

    return items;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vscode-contrib2" is now active!');

    const watcher = vscode.workspace.createFileSystemWatcher("**", false, true, true);
    watcher.onDidCreate((e) => {
        let item: IItem = {
            id: "itemx",
            title: e.path,
            description: e.path,
            action: {
                name: "Login",
                type: ActionType.Execute,
                performAction: () => {
                    return vscode.commands.executeCommand("workbench.action.openGlobalSettings");
                },
            },
            labels: []
        };

        let collection: ICollection = {
            id: "collection3",
            title: "Demo collection 3",
            description: "This is another demo collection. It appears only after a file is created in the workspace",
            type: CollectionType.Platform,
            itemIds: [
                "SAPOSS.vscode-contrib2.itemx",
            ]
        };
        collections = [collection];
    
        items = [item];
        changedCallback.call(changedCallbackThis, "SAPOSS.vscode-contrib2");
    });

    const guidedDevContribution : IGuidedDevContribution = {
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

export function deactivate() {}

// OPEN ISSUES:
//   Collection that reference items from other contributors:
//      Are those items necessarily not bound to a specific project?
//      Does that mean they are static?
//      No labels?
//      Constant item IDs?
