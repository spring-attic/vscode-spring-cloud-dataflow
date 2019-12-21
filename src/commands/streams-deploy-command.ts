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
import { injectable, inject } from 'inversify';
import { LanguageServerManager, NotificationManager } from '@pivotal-tools/vscode-extension-core';
import { Command, DITYPES } from '@pivotal-tools/vscode-extension-di';
import { COMMAND_SCDF_STREAMS_DEPLOY, LSP_SCDF_DEPLOY_STREAM, LANGUAGE_SCDF_STREAM_PREFIX } from '../extension-globals';
import { DataflowStreamDeployParams } from './stream-commands';
import { TYPES } from '../types';
import { ServerRegistrationManager } from '../service/server-registration-manager';
import { DataflowResponse } from '../language/scdf-language-interfaces';
import { StreamsExplorerProvider } from '../explorer/streams-explorer-provider';

@injectable()
export class StreamsDeployCommand implements Command {

    constructor(
        @inject(TYPES.ServerRegistrationManager) private serverRegistrationManager: ServerRegistrationManager,
        @inject(DITYPES.LanguageServerManager) private languageServerManager: LanguageServerManager,
        @inject(DITYPES.NotificationManager) private notificationManager: NotificationManager,
        @inject(TYPES.StreamsExplorerProvider) private streamsExplorerProvider: StreamsExplorerProvider
    ) {}

    get id() {
        return COMMAND_SCDF_STREAMS_DEPLOY;
    }

    async execute(params: DataflowStreamDeployParams) {
        const defaultServer = await this.serverRegistrationManager.getDefaultServer();
        if (defaultServer) {
            const p: DataflowStreamDeployParams = {
                name: params.name,
                server: params.server || defaultServer.name,
                properties: params.properties || {}
            };
            this.notificationManager.showMessage(`Deploying stream ${params.name}`);
            const response: DataflowResponse = await this.languageServerManager
                .getLanguageClient(LANGUAGE_SCDF_STREAM_PREFIX).sendRequest(LSP_SCDF_DEPLOY_STREAM, p);
            this.notificationManager.showMessage(response.message);
            this.streamsExplorerProvider.refresh();
        }
    }
}
