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
import { ReadOnlyDocumentManager } from '@pivotal-tools/vscode-extension-core';
import { Command, DITYPES } from '@pivotal-tools/vscode-extension-di';
import { COMMAND_SCDF_JOBS_EXECUTION_INSPECT } from '../extension-globals';
import { ServerRegistration } from '../service/server-registration-manager';
import { ScdfModel } from '../service/scdf-model';
import { JobNode } from '../explorer/models/job-node';

@injectable()
export class JobsExecutionInspectCommand implements Command {

    constructor(
        @inject(DITYPES.ReadOnlyDocumentManager) private readOnlyDocumentManager: ReadOnlyDocumentManager
    ) {}

    get id() {
        return COMMAND_SCDF_JOBS_EXECUTION_INSPECT;
    }

    async execute(jobNode: JobNode) {
        const server: ServerRegistration = jobNode.registration;
        const model = new ScdfModel(server);
        const data = await model.getJobExecution(jobNode.executionId);
        const node = {label: `${jobNode.jobName}-${jobNode.executionId}`, fullId: `${jobNode.executionId}`};
        await this.readOnlyDocumentManager.openReadOnlyJson(node, data);
    }
}
