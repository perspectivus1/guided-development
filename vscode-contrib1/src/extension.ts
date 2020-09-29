import { ICollection, CollectionType, IItem, ManagerAPI } from './types/GuidedDev';
import * as vscode from 'vscode';
import * as _ from 'lodash';
import { ICommandAction, IExecuteAction } from 'bas-platform';

const datauri = require("datauri");

const EXT_ID = "saposs.vscode-contrib1";

let openSettingsAction: IExecuteAction;
let showMessageAction: IExecuteAction;
let cloneAction: IExecuteAction;
let openGlobalSettingsAction: ICommandAction;
let showInfoMessageAction: IExecuteAction;
let extensionPath: string;

var path = require('path');
// const DEFAULT_IMAGE = require("../defaultImage");

function getCollections(): ICollection[] {
    const collections: Array<ICollection> = [];
    let collection: ICollection = {
        id: "collection1",
        title: "Demo collection 1 [Scenario]",
        description: "This is a demo collection. It contains self-contributed items and and an item contributed by a different contributor.",
        type: CollectionType.Scenario,
        itemIds: [
            "saposs.vscode-contrib1.open",
            "saposs.vscode-contrib1.clone",
            "saposs.vscode-contrib1.open-command",
            "saposs.vscode-contrib2.cf-login",
            "saposs.vscode-contrib1.show-info",
            "saposs.vscode-contrib1.show-items"
        ]
    };
    collections.push(collection);

    return collections;
}

function getItems(): Array<IItem> {
    const items: Array<IItem> = [];
    let item: IItem = {
        id: "open",
        title: "Open Global Settings",
        description: "It is easy to configure Visual Studio Code to your liking through its various settings.",
        image: getImage(path.join(extensionPath, 'resources', 'settings2.png')),
        action1: openSettingsAction,
        action2: showMessageAction,
        labels: [
            {"Project Name": "cap1"},
            {"Project Type": "CAP"},
            {"Path": "/home/user/projects/cap1"}
        ]
    };
    items.push(item);

    item = {
        id: "clone",
        title: "Cloning code-snippet repository",
        description: "A VSCode extension that provides a simple way to add code snippets..",
        action1: cloneAction,
        labels: []
    };
    items.push(item);

    item = {
        id: "open-command",
        title: "Open Command  - Global Settings",
        description: "It is easy to configure Visual Studio Code to your liking through its various settings.",
        action1: openGlobalSettingsAction,
        labels: [
            {"Project Name": "cap1"},
            {"Project Type": "CAP"},
            {"Path": "/home/user/projects/cap1"}
        ]
    };
    items.push(item);

    item = {
        id: "show-info",
        title: "Show info message",
        description: "Shows a information message",
        image: getImage(path.join(extensionPath, 'resources', 'info.png')),
        action1: showInfoMessageAction,
        labels: [
            {"Project Name": "cap2"},
            {"Project Type": "CAP"},
            {"Path": "/home/user/projects/cap2"}
        ]
    };
    items.push(item);

    item = {
        id: "show-items",
        title: "Show items",
        description: "Shows list of items",
        image: getImage(path.join(extensionPath, 'resources', 'items.png')),
        itemIds: [
            "saposs.vscode-contrib1.open",
            "saposs.vscode-contrib2.cfLogin",
            "saposs.vscode-contrib1.show-info"
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

export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "vscode-contrib1" is now active!');
    const basAPI = await vscode.extensions.getExtension("SAPOSS.bas-platform")?.exports;
    const managerAPI: ManagerAPI = await basAPI.getExtensionAPI("SAPOSS.guided-development");

    extensionPath = context.extensionPath;

    openSettingsAction = new basAPI.actions.ExecuteAction();
    openSettingsAction.name = "Open"
    openSettingsAction.title = "Open Settings";
    openSettingsAction.performAction = () => {
        return vscode.commands.executeCommand("workbench.action.openGlobalSettings");
    };

    showMessageAction = new basAPI.actions.ExecuteAction();
    showMessageAction.name = "Show";
    showMessageAction.title = "Show Message";
    showMessageAction.performAction = () => {
        return vscode.window.showInformationMessage("Hello from Open Global Settings item");
    };

    cloneAction = new basAPI.actions.ExecuteAction();
    cloneAction.name = "Clone"
    cloneAction.title = "Cloning Repository";
    cloneAction.performAction = () => {
        return vscode.commands.executeCommand("git.clone", "https://github.com/SAP/code-snippet.git");
    };

    openGlobalSettingsAction = new basAPI.actions.CommandAction();
    openGlobalSettingsAction.name = "Open"
    openGlobalSettingsAction.command = {name: "workbench.action.openGlobalSettings"};

    showInfoMessageAction = new basAPI.actions.ExecuteAction();
    showInfoMessageAction.name = "Show";
    showInfoMessageAction.title = "Show info message";
    showInfoMessageAction.performAction = () => {
        return vscode.window.showInformationMessage("Hello from guided development item");
    };
    
    managerAPI.setData(EXT_ID, getCollections(), getItems());
}

function getImage(imagePath: string) :string {
    let image;
    try {
      image = datauri.sync(imagePath);
    } catch (error) {
        // image = DEFAULT_IMAGE;
    }
    return image;
}


export function deactivate() {}
