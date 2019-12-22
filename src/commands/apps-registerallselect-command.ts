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
import { Uri, window } from 'vscode';
import { injectable, inject } from 'inversify';
import { Command, DITYPES } from '@pivotal-tools/vscode-extension-di';
import { COMMAND_SCDF_APPS_REGISTERALLSELECT } from '../extension-globals';
import { ServerRegistrationManager } from '../service/server-registration-manager';
import { TYPES } from '../types';
import { ScdfModel } from '../service/scdf-model';
import { AppsExplorerProvider } from '../explorer/apps-explorer-provider';
import { StreamsExplorerProvider } from '../explorer/streams-explorer-provider';
import { NotificationManager } from '@pivotal-tools/vscode-extension-core';

@injectable()
export class AppsRegisterAllSelectCommand implements Command {

    constructor(
        @inject(TYPES.ServerRegistrationManager) private serverRegistrationManager: ServerRegistrationManager,
        @inject(TYPES.AppsExplorerProvider) private appsExplorerProvider: AppsExplorerProvider,
        @inject(TYPES.StreamsExplorerProvider) private streamsExplorerProvider: StreamsExplorerProvider,
        @inject(DITYPES.NotificationManager) private notificationManager: NotificationManager,
    ) {}

    get id() {
        return COMMAND_SCDF_APPS_REGISTERALLSELECT;
    }

    async execute(uri: Uri) {
        const servers = await this.serverRegistrationManager.getServers();
        const names: string[] = [];
        servers.forEach(server => {
            names.push(server.name);
        });
        const result = await window.showQuickPick(names, {
            placeHolder: ''
        });
        if (!result) {
            return;
        }

        const server = servers.find(server => server.name === result);

        if (!server) {
            return;
        }

        let uris: string[] = [];

        const editor = window.activeTextEditor;
        if (editor) {
            const lineCount = editor.document.lineCount;
            for (let i = 0; i < lineCount; i++) {
                const line = editor.document.lineAt(i);
                if (line.text) {
                    const trimmed = line.text.trim();
                    if (trimmed.length > 0) {
                        uris.push(trimmed);
                    }
                }
            }
        }

        const model = new ScdfModel(server);
        await model.registerApps(uris);
        this.notificationManager.info(`Registration request for new apps sent`);
        this.appsExplorerProvider.refresh();
        this.streamsExplorerProvider.refresh();
    }
}
