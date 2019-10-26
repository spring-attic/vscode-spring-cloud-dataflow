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
import { Command } from '@pivotal-tools/vscode-extension-di';
import { COMMAND_SCDF_TASKS_DEBUG_ATTACH } from '../extension-globals';
import { TYPES } from '../types';
import { StreamDebugManager } from '../debug/stream-debug-manager';
import { ExecutionNode } from '../explorer/models/execution-node';

@injectable()
export class TasksDebugAttachCommand implements Command {

    constructor(
        @inject(TYPES.StreamDebugManager) private streamDebugManager: StreamDebugManager
    ) {}

    get id() {
        return COMMAND_SCDF_TASKS_DEBUG_ATTACH;
    }

    async execute(args: ExecutionNode) {
        const debugConfiguration = await this.streamDebugManager.taskExecutionNodeDebugConfiguration(args);
        this.streamDebugManager.launchDebug([debugConfiguration]);
    }
}
