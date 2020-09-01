import * as _ from 'lodash';
import * as vscode from 'vscode';
import { GuidedDevelopment } from "../guided-development";
import { RpcExtension } from '@sap-devx/webview-rpc/out.ext/rpc-extension';
import { AppLog } from "../app-log";
import backendMessages from "../messages";
import { OutputChannelLog } from '../output-channel-log';
import { AppEvents } from "../app-events";
import { VSCodeEvents } from '../vscode-events';
import { AbstractWebviewPanel } from './AbstractWebviewPanel';
import { Contributors } from "../contributors";
import { IInternalItem, IInternalCollection } from "../Collection";

export class GuidedDevelopmentPanel extends AbstractWebviewPanel {
	public static GUIDED_DEVELOPMENT = "Guided Development";

	private static channel: vscode.OutputChannel;

	public toggleOutput() {
		this.outputChannel.showOutput();
	}

	public setWebviewPanel(webViewPanel: vscode.WebviewPanel, uiOptions?: any) {
		super.setWebviewPanel(webViewPanel);

		const collections = Contributors.getInstance().getCollections();
		this.items = Contributors.getInstance().getItems();
		if (_.isNil(collections)) {
			return vscode.window.showErrorMessage("Could not find guided development contributions");
		}

		this.messages = backendMessages;

		const rpc = new RpcExtension(this.webViewPanel.webview);
		this.outputChannel = new OutputChannelLog(this.messages.channelName);
		const vscodeEvents: AppEvents = new VSCodeEvents();
		this.guidedDevelopment = new GuidedDevelopment(rpc, 
			vscodeEvents, 
			this.outputChannel, 
			this.logger,
			this.messages,
			collections,
			this.items
		);

		Contributors.getInstance().registerOnItemsChangedCallback(this.guidedDevelopment, this.guidedDevelopment.setCollections);

		this.initWebviewPanel();
	}

	public static getOutputChannel(channelName: string): vscode.OutputChannel {
		if (!this.channel) {
			this.channel = vscode.window.createOutputChannel(`${GuidedDevelopmentPanel.GUIDED_DEVELOPMENT}.${channelName}`);
		}

		return this.channel;
	}

	private guidedDevelopment: GuidedDevelopment;
	private items: Map<String, IInternalItem>;
	private messages: any;
	private outputChannel: AppLog;

	public constructor(context: vscode.ExtensionContext) {
		super(context);
		this.viewType = "guidedDevelopment";
		this.viewTitle = GuidedDevelopmentPanel.GUIDED_DEVELOPMENT;
		this.focusedKey = "guidedDevelopment.Focused";
	}

	public disposeWebviewPanel() {
		super.disposeWebviewPanel();
		this.guidedDevelopment = null;
	}

	public initWebviewPanel() {
		super.initWebviewPanel();
		this.webViewPanel.title = this.messages.title;
	}
}
