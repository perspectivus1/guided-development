// import { IGuidedDev } from '@sap-devx/guided-development-types';
import { ICollection, CollectionType, IItem, ActionType, IGuidedDevContribution } from './types/GuidedDev';
import * as vscode from 'vscode';
import * as path from 'path';
import * as _ from 'lodash';

const datauri = require("datauri");

const EXT_ID = "saposs.contrib-cake";
let changedCallback: (id: string) => void;
let changedCallbackThis: Object;
const bakeCollectionMap: Map<string, ICollection> = new Map();

let bakeCollectionTemplate: ICollection;

bakeCollectionTemplate = {
    id: "collection2",
    title: "Bake a Cake",
    description: "This is a repice for making baked cakes. You can bake a cake only if there is a bake.json file in your workspace",
    type: CollectionType.Scenario,
    itemIds: [
        "saposs.contrib-cake.buy-ingredients",
        "saposs.contrib-oven.prep-oven",
        "saposs.contrib-cake.mix-ingredients",
        "saposs.contrib-cake.pour-mix",
        "saposs.contrib-cake.place-pan",
        "saposs.contrib-oven.bake",
        "saposs.contrib-cake.eat-cake",
    ]
};

function getCollections(): ICollection[] {
    const collections: ICollection[] = [];
    let collection: ICollection;

    collection = {
        id: "collection1",
        title: "Make a No Bake Cake",
        description: "This is a recipe for making a no-bake cake",
        type: CollectionType.Scenario,
        itemIds: [
            "saposs.contrib-cake.buy-ingredients",
            "saposs.contrib-cake.mix-ingredients",
            "saposs.contrib-cake.pour-mix",
            "saposs.contrib-cake.eat-cake",
        ]
    };
    collections.push(collection);

    for (const collection of bakeCollectionMap.values()) {
        collections.push(collection);
    }

    return collections;
}

function addBakeCollection(path: string): void {
    // clone collection template
    const collection: ICollection = JSON.parse(JSON.stringify(bakeCollectionTemplate));
    collection.id = `bake-${path}`;
    collection.title = `Bake a Cake (${path})`;
    bakeCollectionMap.set(path, collection);
}

function removeBakeCollection(path: string): void {
    bakeCollectionMap.delete(path);
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "contrib-cake" is now active!');

    vscode.workspace.onDidChangeWorkspaceFolders((e) => {
        // when first folder is added to the workspace, the extension is reactivated, so we could let the find files upon activation handle this use-case
        // when last folder removed from workspace, the extension is reactivated, so we could let the find files upon activation handle this use-case

        for (const folder of e.removed) { 
            console.dir(`${folder.uri.path} removed from workspace`);
            removeBakeCollection(folder.uri.path);
            if (changedCallback) {
                changedCallback.call(changedCallbackThis, EXT_ID);
            }
        }

        for (const folder of e.added) { 
            console.dir(`${folder.uri.path} added to workspace`);
            addBakeCollection(folder.uri.path);
            if (changedCallback) {
                changedCallback.call(changedCallbackThis, EXT_ID);
            }
        }
    });

    const watcher = vscode.workspace.createFileSystemWatcher("**/bake.json");
    watcher.onDidDelete((e) => {
        console.log(`${e.path} deleted`);
        removeBakeCollection(path.dirname(e.path));
        if (changedCallback) {
            changedCallback.call(changedCallbackThis, EXT_ID);
        }
    });

    watcher.onDidCreate((e) => {
        console.log(`${e.path} created`);
        addBakeCollection(path.dirname(e.path));
        if (changedCallback) {
            changedCallback.call(changedCallbackThis, EXT_ID);
        }
    });

    watcher.onDidChange((e) => {
        console.log(`${e.path} changed`);
        // TODO: update items based on contents of bake.json?
        if (changedCallback) {
            changedCallback.call(changedCallbackThis, EXT_ID);
        }
    });

    vscode.workspace.findFiles("**/bake.json").then((uris) => {
        for (const uri of uris) {
            console.log(`found ${uri.path} on activation`);
            addBakeCollection(path.dirname(uri.path));
            if (changedCallback) {
                changedCallback.call(changedCallbackThis, EXT_ID);
            }
        }
    });

    const guidedDevContribution: IGuidedDevContribution = {
        // return items based on workspace folders/projects
        getCollections: () => {
            return getCollections();
        },
        getItems: () => {
            const items: Array<IItem> = [];
            let item: IItem = {
                id: "eat-cake",
                title: "Eat Cake",
                description: "Bon appetite",
                image: getImage(path.join(context.extensionPath, 'resources', 'cake1.jpg')),
                action: {
                    name: "Eat",
                    type: ActionType.Execute,
                    performAction: () => {
                        return vscode.commands.executeCommand("workbench.action.openGlobalSettings");
                    },
                },
                labels: [
                    { "Project Name": "cap1" },
                    { "Project Type": "CAP" },
                    { "Path": "/home/user/projects/cap1" }
                ]
            };
            items.push(item);

            item = {
                id: "buy-ingredients",
                title: "Buy Ingredients",
                description: "Buy relevant ingredeients for your cake",
                action: {
                    name: "Buy",
                    type: ActionType.Execute,
                    performAction: () => {
                        return vscode.commands.executeCommand("git.clone", "https://github.com/SAP/code-snippet.git");
                    },
                },
                labels: []
            };
            items.push(item);

            item = {
                id: "mix-ingredients",
                title: "Mix Ingredients",
                description: "Mix ingredeients according to recipe",
                action: {
                    name: "Mix",
                    type: ActionType.Execute,
                    performAction: () => {
                        return vscode.commands.executeCommand("git.clone", "https://github.com/SAP/code-snippet.git");
                    },
                },
                labels: []
            };
            items.push(item);

            item = {
                id: "insert-pan",
                title: "Insert Pan into Oven",
                description: "Insert the pan into the oven",
                action: {
                    name: "Insert",
                    type: ActionType.Execute,
                    performAction: () => {
                        return vscode.commands.executeCommand("git.clone", "https://github.com/SAP/code-snippet.git");
                    },
                },
                labels: []
            };
            items.push(item);

            item = {
                id: "pour-mix",
                title: "Pour Mix into Pan",
                description: "Pour the cake mix into the pan",
                image: getImage(path.join(context.extensionPath, 'resources', 'info.png')),
                action: {
                    name: "Pour",
                    type: ActionType.Execute,
                    performAction: () => {
                        return vscode.window.showInformationMessage("The cake mix was poured into the pan");
                    },
                },
                labels: [
                    { "Project Name": "cap2" },
                    { "Project Type": "CAP" },
                    { "Path": "/home/user/projects/cap2" }
                ]
            };
            items.push(item);

            item = {
                id: "place-pan",
                title: "Place Pan in Oven",
                description: "Place the pan with the mix in the oven",
                itemIds: [
                    "saposs.contrib-oven.open-oven",
                    "saposs.contrib-cake.insert-pan",
                    "saposs.contrib-oven.close-oven"
                ],
                labels: [
                    { "Project Name": "cap2" },
                    { "Project Type": "CAP" },
                    { "Path": "/home/user/projects/cap2" }
                ]
            };
            items.push(item);

            return items;
        },
        registerOnChangedCallback: (thisArg: Object, callback: (id: string) => void) => {
            changedCallbackThis = thisArg;
            changedCallback = callback;
        }
    };

    const api = {
        guidedDevContribution
    };

    return api;
}

function getImage(imagePath: string): string {
    let image;
    try {
        image = datauri.sync(imagePath);
    } catch (error) {
        // image = DEFAULT_IMAGE;
    }
    return image;
}


export function deactivate() { }

// OPEN ISSUES:
//   Collection that reference items from other contributors:
//      Are those items necessarily not bound to a specific project?
//      Does that mean they are static?
//      No labels?
//      Constant item IDs?
