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
import { COMMAND_SCDF_EXPLORER_REFRESH } from '../extension-globals';
import { TYPES } from '../types';
import { AppsExplorerProvider } from '../explorer/apps-explorer-provider';
import { StreamsExplorerProvider } from '../explorer/streams-explorer-provider';
import { TasksExplorerProvider } from '../explorer/tasks-explorer-provider';
import { JobsExplorerProvider } from '../explorer/jobs-explorer-provider';

@injectable()
export class ExplorerRefreshCommand implements Command {

    constructor(
        @inject(TYPES.AppsExplorerProvider) private appsExplorerProvider: AppsExplorerProvider,
        @inject(TYPES.StreamsExplorerProvider) private streamsExplorerProvider: StreamsExplorerProvider,
        @inject(TYPES.TasksExplorerProvider) private tasksExplorerProvider: TasksExplorerProvider,
        @inject(TYPES.JobsExplorerProvider) private jobsExplorerProvider: JobsExplorerProvider
    ) {}

    get id() {
        return COMMAND_SCDF_EXPLORER_REFRESH;
    }

    execute() {
        this.appsExplorerProvider.refresh();
        this.streamsExplorerProvider.refresh();
        this.tasksExplorerProvider.refresh();
        this.jobsExplorerProvider.refresh();
    }
}
