import * as mocha from "mocha";
import * as sinon from "sinon";
const datauri = require("datauri"); // eslint-disable-line @typescript-eslint/no-var-requires
import * as fsextra from "fs-extra";
import { expect } from "chai";
import * as _ from "lodash";
import * as path from "path";
import {GuidedDevelopment} from "../src/guided-development";
import { AppLog } from "./app-log";
import { AppEvents } from './app-events';
import { IMethod, IPromiseCallbacks, IRpc } from "@sap-devx/webview-rpc/out.ext/rpc-common";
import { IChildLogger } from "@vscode-logging/logger";
import * as os from "os";
import { fail } from "assert";

describe('guidedDevelopment unit test', () => {
    let sandbox: any;
    let yeomanEnvMock: any;
    let fsExtraMock: any;
    let datauriMock: any;
    let loggerMock: any;
    let rpcMock: any;
    let appEventsMock: any;
    const UTF8 = "utf8";
    const PACKAGE_JSON = "package.json";

    const choiceMessage = 
        "Some quick example text of the guidedDevelopment description. This is a long text so that the example will look good.";
    class TestEvents implements AppEvents {
        public async doApply(we: any): Promise<any> {
            return;
        }
        public doSnippeDone(success: boolean, message: string, targetPath?: string): void {
            return;
        }
    }
    class TestRpc implements IRpc {
        public  timeout: number;
        public promiseCallbacks: Map<number, IPromiseCallbacks>;
        public methods: Map<string, IMethod>;
        public sendRequest(): void {
            return;
        }            
        public sendResponse(): void {
            return;
        } 
        public setResponseTimeout(): void {
            return;
        }
        public registerMethod(): void {
            return;
        } 
        public unregisterMethod(): void {
            return;
        } 
        public listLocalMethods(): string[] {
            return [];
        }
        public handleResponse(): void {
            return;
        } 
        public listRemoteMethods(): Promise<string[]> {
            return Promise.resolve([]);
        }
        public invoke(): Promise<any> {
            return Promise.resolve();
        }
        public handleRequest(): Promise<void> {
            return Promise.resolve();
        }
    }
    class TestOutputChannel implements AppLog {
        public log(): void {
            return;
        }            
        public writeln(): void {
            return;
        } 
        public create(): void {
            return;
        }  
        public force(): void {
            return;
        } 
        public conflict(): void {
            return;
        }  
        public identical(): void {
            return;
        }  
        public skip(): void {
            return;
        } 
        public showOutput(): boolean {
            return false;
        }  
    }

    const testLogger = {debug: () => {}, error: () => {}, fatal: () => {}, warn: () => {}, info: () => {}, trace: () => {}, getChildLogger: () => ({} as IChildLogger)};

    const rpc = new TestRpc();
    const outputChannel = new TestOutputChannel();
    const appEvents = new TestEvents();
    const uiOptions = {messages: {title: "guidedDev title"}};
    const guidedDevelopment: GuidedDevelopment = new GuidedDevelopment(rpc, appEvents, outputChannel, testLogger, uiOptions);

    before(() => {
        sandbox = sinon.createSandbox();
    });

    after(() => {
        sandbox.restore();
    });

    beforeEach(() => {
        fsExtraMock = sandbox.mock(fsextra);
        datauriMock = sandbox.mock(datauri);
        rpcMock = sandbox.mock(rpc);
        loggerMock = sandbox.mock(testLogger);
        appEventsMock = sandbox.mock(appEvents);
    });

    afterEach(() => {
        yeomanEnvMock.verify();
        fsExtraMock.verify();
        datauriMock.verify();
        rpcMock.verify();
        loggerMock.verify();
        appEventsMock.verify();
    });

    it("constructor", () => {
        try {
            new GuidedDevelopment(undefined, undefined, undefined, undefined, undefined);
            fail("contructor should throw an exception");
        } catch (error) {
            expect(error.message).to.be.equal("rpc must be set");
        }
    });

    it("getState", async () => {
        const state = await guidedDevelopment["getState"]();
        expect(state).to.deep.equal(uiOptions);
    });

    describe("receiveIsWebviewReady", () => {
        it("flow is successfull", async () => {
            rpcMock.expects("invoke").withArgs("showPrompt").resolves(
                {actionName: "actionName"},
                {actionTemplate: "OData action"},
                {actionType: "Create entity"});
            await guidedDevelopment["receiveIsWebviewReady"]();
        });
    });

    it("toggleOutput", () => {
        const guidedDevelopmentInstance: GuidedDevelopment = new GuidedDevelopment(rpc, appEvents, outputChannel, testLogger, {});
        const res = guidedDevelopmentInstance["toggleOutput"]();
        expect(res).to.be.false;
    });

    it("getErrorInfo", () => {
        const guidedDevelopmentInstance: GuidedDevelopment = new GuidedDevelopment(rpc, appEvents, outputChannel, testLogger, {});
        const errorInfo = "Error Info";
        const res = guidedDevelopmentInstance["getErrorInfo"](errorInfo);
        expect(res).to.be.equal(errorInfo);
    });

    describe("answersUtils", () => {
        it("setDefaults", () => {
            const questions = [
                {name: "q1", default: "a"},
                {name: "q2", default: () => { return "b";}},
                {name: "q3"}
            ];
            const answers = {
                q1: "x",
                q2: "y",
                q3: "z"
            };
            for (const question of questions) {
                switch (question.name) {
                    case "a":
                        expect((question as any)["answer"]).to.equal("x");
                        break;
                    case "b":
                        expect((question as any)["answer"]).to.equal("y");
                        break;
                    case "c":
                        expect((question as any)["answer"]).to.equal("z");
                        break;
                }
            }
        });
    });

    describe("onSuccess - onFailure", () => {
        let doSnippeDoneSpy: any;

        beforeEach(() => {
            doSnippeDoneSpy = sandbox.spy(appEvents, "doSnippeDone");
        });

        afterEach(() => {
            doSnippeDoneSpy.restore();
        });

        it("onSuccess", () => {
            guidedDevelopment["onSuccess"]("testGuidedDevName");
            expect(doSnippeDoneSpy.calledWith(true, "'testGuidedDevName' guided-development has been created.")).to.be.true;
        });

        it("onFailure", async () => {
            await guidedDevelopment["onFailure"]("testGuidedDevName", "testError");
            expect(doSnippeDoneSpy.calledWith(false, "testGuidedDevName guided-development failed.\ntestError")).to.be.true;
        });
    });

    const guidedDev: any = {
        getMessages() {
            return {
                title: "Create Launch Configuration",
                description: "Provide details for the launch configuration you want to create."
            };
        },
        getAction() {
            return {
                actionButton: "Create"
            };
        }
    };

    describe("createGuidedDevelopmentObj", () => {
        it("guidedDev has getQuestions ---> call getQuestions", async () => {
            const myGuidedDevelopment = new GuidedDevelopment(rpc, appEvents, outputChannel, testLogger, {guidedDevs: [guidedDev]});
            const gdi = await myGuidedDevelopment["createGuidedDevelopmentObj"]();
            expect(gdi).to.be.equal([guidedDev]);
        });
    });
});