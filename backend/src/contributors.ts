import * as vscode from 'vscode';
import * as _ from 'lodash';
import { IInternalItem, IInternalCollection } from "./Collection";
import { IItem, IGuidedDevContribution } from './types/GuidedDev';

export class Contributors {
    private onItemsChangedCallback: (collections: Array<IInternalCollection>) => void;
    private onItemsChangedCallbackThis: Object;

    public registerOnItemsChangedCallback(thisArg: Object, callback: (collections: Array<IInternalCollection>) => void): void {
        this.onItemsChangedCallback = callback;
        this.onItemsChangedCallbackThis = thisArg;
    }

    public static getInstance(): Contributors {
        if (!Contributors.contributors) {
            Contributors.contributors = new Contributors();
        }
        return Contributors.contributors;
    }

    private constructor() {
        this.collectionsMap = new Map();
        this.apiMap = new Map();
        this.items = new Map();
    }

    private static contributors: Contributors;

    private collectionsMap: Map<string, Array<IInternalCollection>>;
    private apiMap: Map<string, IGuidedDevContribution>;
    private items: Map<string, IInternalItem>;

    public getCollections(): Array<IInternalCollection> {
        const collections: Array<IInternalCollection> = [];
        for (const extensionCollections of this.collectionsMap.values()) {
            collections.push(...extensionCollections);
        }

        return _.sortBy(collections, ['type']);
    }

    public getItems(): Map<string, IInternalItem> {
        return this.items;
    }

    private add(extensionId: string, api: any) {
        if (api.guidedDevContribution) {
            const contribution: IGuidedDevContribution = api.guidedDevContribution;
            this.apiMap.set(extensionId, contribution);

            // register self as callback for contributors to call when items are changed
            contribution.registerOnChangedCallback(this, this.onChanged);

            this.addItems(extensionId, contribution.getItems());

            this.addCollections(extensionId, contribution.getCollections() as IInternalCollection[]);
        }
    }

    private static async getApi(extension: vscode.Extension<any>): Promise<any> {
        let api;
        if (!extension.isActive) {
            try {
                api = await extension.activate();
            } catch (error) {
                console.error(error);
                // TODO: Add Logger.error here ("Failed to activate extension", {extensionId: extensionId})
            }
        } else {
            api = extension.exports;
        }
        return api;
    }

    public onChanged(extensionId: string): void {
        console.log("in onChanged");
        // other collections might be affected by items changed by current extension
        const contribution = this.apiMap.get(extensionId);
        if (contribution) {
            const collections = contribution.getCollections();
            this.collectionsMap.set(extensionId, collections as IInternalCollection[]);

            const items = contribution.getItems();
            this.addItems(extensionId, items);
            this.initCollections();
            this.onItemsChangedCallback.call(this.onItemsChangedCallbackThis, this.getCollections());
        }
    }

    public async init() {
        const allExtensions: readonly vscode.Extension<any>[] = vscode.extensions.all;
        for await (const extension of allExtensions) {
            const currentPackageJSON: any = _.get(extension, "packageJSON");
            const guidedDevelopmentContribution: any = _.get(currentPackageJSON, "BASContributes.guided-development");
            if (!_.isNil(guidedDevelopmentContribution)) {
                const api = await Contributors.getApi(extension);
                this.add(extension.id, api);
            }
        }
        this.initCollections();
    }

    private addItems(extensionId: string, items: Array<IInternalItem>) {
        for (const item of items) {
            item.fqid = `${extensionId}.${item.id}`;
            this.items.set(item.fqid, item);
        }
    }

    private addCollections(extensionId: string, collections: Array<IInternalCollection>) {
        this.collectionsMap.set(extensionId, collections);
    }

    private initCollections() {
        this.initCollectionItems();
    }

    private initCollectionItems() {
        for (const extensionCollections of this.collectionsMap.values()) {
            for (const collection of extensionCollections) {
                collection.items = [];
                for (const itemId of collection.itemIds) {
                    const item: IInternalItem = this.items.get(itemId);
                    if (item) {
                        collection.items.push(item);
                        this.initItems(item);
                    }
                }
            }
        }
    }

    private initItems(item: IInternalItem) {
        if (!item.itemIds || item.itemIds == []) {
            return
        }
        item.items = []
        for (const itemId of item.itemIds) {
            const subitem: IInternalItem = this.items.get(itemId);
            if (subitem) {
                item.items.push(subitem);
                this.initItems(subitem);
            }
        }
    }
}
