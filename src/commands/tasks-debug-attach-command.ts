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
import { Command, DITYPES } from '@pivotal-tools/vscode-extension-di';
import { COMMAND_SCDF_TASKS_DEBUG_ATTACH } from '../extension-globals';
import { TYPES } from '../types';
import { ExecutionNode } from '../explorer/models/execution-node';
import { DebugManager } from '../debug/debug-manager';
import { NotificationManager } from '@pivotal-tools/vscode-extension-core';

@injectable()
export class TasksDebugAttachCommand implements Command {

    constructor(
        @inject(TYPES.DebugManager) private debugManager: DebugManager,
        @inject(DITYPES.NotificationManager) private notificationManager: NotificationManager
    ) {}

    get id() {
        return COMMAND_SCDF_TASKS_DEBUG_ATTACH;
    }

    async execute(node: ExecutionNode) {
        const executionId = node.executionId;
        const serverRegistration = node.registration;

        this.debugManager.getTaskDebugHandler(executionId, serverRegistration)
            .then(handler => {
                handler.attach();
            }, error => {
                this.notificationManager.showMessage('Unable to start debug');
            });
    }
}
