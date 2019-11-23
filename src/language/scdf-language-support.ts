/*
 * Copyright 2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { inject, injectable } from 'inversify';
import * as Path from 'path';
import { ExtensionContext, commands, workspace } from 'vscode';
import {
    LanguageClient, LanguageClientOptions, ServerOptions, NotificationType, ErrorHandler, ErrorAction, Message, CloseAction
} from 'vscode-languageclient';
import { DITYPES } from '@pivotal-tools/vscode-extension-di';
import { LanguageSupport, NotificationManager, JavaFinder } from '@pivotal-tools/vscode-extension-core';
import {
    LANGUAGE_SERVER_JAR, LANGUAGE_SCDF_STREAM_PREFIX, LANGUAGE_SCDF_APP_PREFIX, CONFIG_PREFIX, LANGUAGE_SCDF_DESC,
    COMMAND_SCDF_SERVER_NOTIFY, COMMAND_SCDF_EXPLORER_REFRESH, LSP_SCDF_CREATED_STREAM, LSP_SCDF_DEPLOYED_STREAM,
    LSP_SCDF_UNDEPLOYED_STREAM, LSP_SCDF_DESTROYED_STREAM, LANGUAGE_SCDF_TASK_PREFIX, LSP_SCDF_DESTROYED_TASK,
    LSP_SCDF_CREATED_TASK, LSP_SCDF_LAUNCHED_TASK, LANGUAGE_SCDF_STREAM_RUNTIME_PREFIX
} from '../extension-globals';

class ClientErrorHandler implements ErrorHandler {

    private restarts: number[];

	constructor(private name: string) {
		this.restarts = [];
	}

	public error(error: Error, message: Message, count: number): ErrorAction {
		if (count && count <= 3) {
			console.log(`${this.name} server encountered error: ${message}, ${error && error.toString()}`);
			return ErrorAction.Continue;
		}
		// console.log(`${this.name} server encountered error and will shut down: ${message}, ${error && error.toString()}`);
		return ErrorAction.Shutdown;
	}

	public closed(): CloseAction {
		this.restarts.push(Date.now());
		if (this.restarts.length < 5) {
			// console.log(`The ${this.name} server crashed and will restart.`);
			return CloseAction.Restart;
		} else {
			const diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
			if (diff <= 3 * 60 * 1000) {
				const message = `The ${this.name} server crashed 5 times in the last 3 minutes. The server will not be restarted.`;
				// console.log(message);
				return CloseAction.DoNotRestart;
			}

			// console.log(`The ${this.name} server crashed and will restart.`);
			this.restarts.shift();
			return CloseAction.Restart;
		}
	}
}

@injectable()
export class ScdfLanguageSupport implements LanguageSupport {

    private destroyedStreamNotification = new NotificationType<void,void>(LSP_SCDF_DESTROYED_STREAM);
    private createdStreamNotification = new NotificationType<void,void>(LSP_SCDF_CREATED_STREAM);
    private deployedStreamNotification = new NotificationType<void,void>(LSP_SCDF_DEPLOYED_STREAM);
    private undeployedStreamNotification = new NotificationType<void,void>(LSP_SCDF_UNDEPLOYED_STREAM);
    private destroyedTaskNotification = new NotificationType<void,void>(LSP_SCDF_DESTROYED_TASK);
    private launchedTaskNotification = new NotificationType<void,void>(LSP_SCDF_LAUNCHED_TASK);
    private createdTaskNotification = new NotificationType<void,void>(LSP_SCDF_CREATED_TASK);

    constructor(
        @inject(DITYPES.ExtensionContext) private context: ExtensionContext,
        @inject(DITYPES.NotificationManager) private notificationManager: NotificationManager,
        @inject(DITYPES.JavaFinder) private javaFinder: JavaFinder
    ) {}

    public getLanguageIds(): string[] {
        return [
            LANGUAGE_SCDF_STREAM_PREFIX,
            LANGUAGE_SCDF_STREAM_RUNTIME_PREFIX,
            LANGUAGE_SCDF_TASK_PREFIX,
            LANGUAGE_SCDF_APP_PREFIX
        ];
    }

    public buildLanguageClient(): Thenable<LanguageClient> {
        return new Promise(async (resolve, reject) => {
            const languageClient = new LanguageClient(CONFIG_PREFIX, LANGUAGE_SCDF_DESC, await this.getServerOptions(), this.getLanguageClientOptions());
            languageClient.onReady().then(() => {
                this.notificationManager.showMessage('Started Language Support for ' + this.getLanguageIds().join(','));
                languageClient.onNotification(this.destroyedStreamNotification, () => {
                    commands.executeCommand(COMMAND_SCDF_EXPLORER_REFRESH);
                });
                languageClient.onNotification(this.createdStreamNotification, () => {
                    commands.executeCommand(COMMAND_SCDF_EXPLORER_REFRESH);
                });
                languageClient.onNotification(this.deployedStreamNotification, () => {
                    this.notificationManager.showMessage('Stream deployed');
                    commands.executeCommand(COMMAND_SCDF_EXPLORER_REFRESH);
                });
                languageClient.onNotification(this.undeployedStreamNotification, () => {
                    commands.executeCommand(COMMAND_SCDF_EXPLORER_REFRESH);
                });
                languageClient.onNotification(this.destroyedTaskNotification, () => {
                    this.notificationManager.showMessage('Task destroyed');
                    commands.executeCommand(COMMAND_SCDF_EXPLORER_REFRESH);
                });
                languageClient.onNotification(this.createdTaskNotification, () => {
                    this.notificationManager.showMessage('Task created');
                    commands.executeCommand(COMMAND_SCDF_EXPLORER_REFRESH);
                });
                languageClient.onNotification(this.launchedTaskNotification, () => {
                    this.notificationManager.showMessage('Task launched');
                    commands.executeCommand(COMMAND_SCDF_EXPLORER_REFRESH);
                });
                commands.executeCommand(COMMAND_SCDF_SERVER_NOTIFY);
            });
            resolve(languageClient);
        });
    }

    private parseVMargs(params: any[], vmargsLine: string) {
        if (!vmargsLine) {
            return;
        }
        const vmargs = vmargsLine.match(/(?:[^\s"]+|"[^"]*")+/g);
        if (vmargs === null) {
            return;
        }
        vmargs.forEach(arg => {
            // remove all standalone double quotes
            arg = arg.replace(/(\\)?"/g, ($0, $1) => { return ($1 ? $0 : ''); });
            // unescape all escaped double quotes
            arg = arg.replace(/(\\)"/g, '"');
            if (params.indexOf(arg) < 0) {
                params.push(arg);
            }
        });
    }

    public getServerOptions(): Thenable<ServerOptions> {
        return new Promise(async (resolve, reject) => {
            const args: string[] = [];
            const vmargs = workspace.getConfiguration().get<string>('scdf.ls.vmargs') || '';
            this.parseVMargs(args, vmargs);
            const javaInfo = await this.javaFinder.find();
            const javaCmd = Path.resolve(javaInfo.home + '/bin/java');
            const jarPath = Path.resolve(Path.resolve(this.context.extensionPath), 'out', LANGUAGE_SERVER_JAR);
            const serverOptions: ServerOptions = {
                run: {
                    command: javaCmd,
                    args: args.concat(['-jar', jarPath])
                },
                debug: {
                    command: javaCmd,
                    args: args.concat(['-jar', jarPath, '--spring.profiles.active=dev'])
                }
            };
            resolve(serverOptions);
        });
    }

    public getLanguageClientOptions(): LanguageClientOptions {
        const clientOptions: LanguageClientOptions = {
            documentSelector: [
                LANGUAGE_SCDF_STREAM_PREFIX,
                LANGUAGE_SCDF_STREAM_RUNTIME_PREFIX,
                LANGUAGE_SCDF_TASK_PREFIX,
                LANGUAGE_SCDF_APP_PREFIX
            ],
            errorHandler: new ClientErrorHandler(CONFIG_PREFIX)
        };
        return clientOptions;
    }
}
