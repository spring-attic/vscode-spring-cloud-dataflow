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
import { commands, Uri } from 'vscode';
import { injectable } from 'inversify';
import { Command } from '@pivotal-tools/vscode-extension-di';
import { COMMAND_SCDF_SERVER_DASHBOARD } from '../extension-globals';
import { ServerNode, ServerMode } from '../explorer/models/server-node';

@injectable()
export class ServerDashboardCommand implements Command {

    constructor(
    ) {}

    get id() {
        return COMMAND_SCDF_SERVER_DASHBOARD;
    }

    async execute(node: ServerNode) {
        let uri: string | undefined;
        switch (node.mode) {
            case ServerMode.Apps:
                uri = node.registration.url + '/dashboard/#/apps';
                break;
            case ServerMode.Streams:
                uri = node.registration.url + '/dashboard/#/streams/definitions';
                break;
            case ServerMode.Tasks:
                uri = node.registration.url + '/dashboard/#/tasks/definitions';
                break;
            case ServerMode.Jobs:
                uri = node.registration.url + '/dashboard/#/jobs/executions';
                break;
        }
        if (uri) {
            commands.executeCommand('vscode.open', Uri.parse(uri));
        }
    }
}
