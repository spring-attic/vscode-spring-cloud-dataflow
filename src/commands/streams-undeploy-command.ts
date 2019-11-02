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
import { LanguageServerManager } from '@pivotal-tools/vscode-extension-core';
import { Command, DITYPES } from '@pivotal-tools/vscode-extension-di';
import { COMMAND_SCDF_STREAMS_UNDEPLOY, LSP_SCDF_UNDEPLOY_STREAM } from '../extension-globals';
import { DataflowStreamUndeployParams } from './stream-commands';
import { TYPES } from '../types';
import { ServerRegistrationManager } from '../service/server-registration-manager';

@injectable()
export class StreamsUndeployCommand implements Command {

    constructor(
        @inject(TYPES.ServerRegistrationManager) private serverRegistrationManager: ServerRegistrationManager,
        @inject(DITYPES.LanguageServerManager) private languageServerManager: LanguageServerManager
    ) {}

    get id() {
        return COMMAND_SCDF_STREAMS_UNDEPLOY;
    }

    async execute(params: DataflowStreamUndeployParams) {
        const defaultServer = await this.serverRegistrationManager.getDefaultServer();
        if (defaultServer) {
            const server = params.server || defaultServer.name;
            const p: DataflowStreamUndeployParams = {
                name: params.name,
                server: server
            };
            this.languageServerManager.getLanguageClient('scdfs').sendNotification(LSP_SCDF_UNDEPLOY_STREAM, p);
        }
        // TODO: notify user about errors or missing env
    }
}
