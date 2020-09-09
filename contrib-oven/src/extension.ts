// import { IGuidedDev } from '@sap-devx/guided-development-types';
import { ICollection, CollectionType, IItem, ActionType, IGuidedDevContribution } from './types/GuidedDev';
import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as path from 'path';

let changedCallback: (id: string) => void;
let changedCallbackThis: Object;
let collections: ICollection[] = getInitialCollections();
let items: IItem[] = getInitialItems();

function getInitialCollections(): ICollection[] {
    return [];
}

function getInitialItems(): IItem[] {
    const items: Array<IItem> = [];
    let item: IItem = {
        id: "prep-oven",
        title: "Prepare Oven",
        description: "Prepare your oven",
        action: {
            name: "Turn on",
            type: ActionType.Execute,
            performAction: () => {
                return vscode.window.showQuickPick(["80°","90°","100°"]);
            },
        },
        labels: []
    };
    items.push(item);

    item = {
        id: "open-oven",
        title: "Open Oven",
        description: "Open your oven",
        action: {
            name: "Open",
            type: ActionType.Execute,
            performAction: () => {
                return vscode.window.showInformationMessage("Oven is open");
            },
        },
        labels: []
    };
    items.push(item);

    item = {
        id: "close-oven",
        title: "Close Oven",
        description: "Close your oven",
        action: {
            name: "Close",
            type: ActionType.Execute,
            performAction: () => {
                return vscode.window.showInformationMessage("Oven was closed");
            },
        },
        labels: []
    };
    items.push(item);

    item = {
        id: "bake",
        title: "Bake",
        description: "Bake",
        action: {
            name: "Bake",
            type: ActionType.Execute,
            performAction: () => {
                return vscode.window.showInformationMessage("Baking...");
            },
        },
        labels: []
    };
    items.push(item);

    return items;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "contrib-oven" is now active!');

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
