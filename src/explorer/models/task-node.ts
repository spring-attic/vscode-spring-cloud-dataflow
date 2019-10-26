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
import { IconManager, ThemedIconPath } from '@pivotal-tools/vscode-extension-core';
import { BaseNode } from './base-node';
import { ScdfModel } from '../../service/scdf-model';
import { ServerRegistration } from '../../service/server-registration-manager';
import { ExecutionNode } from './execution-node';

export class TaskNode extends BaseNode {

    constructor(
        label: string,
        public readonly description: string | undefined,
        public readonly taskName: string,
        iconManager: IconManager,
        private readonly registration: ServerRegistration
    ) {
        super(label, description, iconManager, 'definedTask');
    }

    protected getThemedIconPath(): ThemedIconPath {
        return this.getIconManager().getThemedIconPath('task');
    }

    public async getChildren(element: BaseNode): Promise<BaseNode[]> {
        return this.getExecutionNodes();
    }

    private async getExecutionNodes(): Promise<ExecutionNode[]> {
        const executionNodes: ExecutionNode[] = [];
        const scdfModel = new ScdfModel(this.registration);
        await scdfModel.getTaskExecutions(this.taskName)
            .then(executions => executions
                .forEach(execution => {
                    executionNodes.push(new ExecutionNode(
                        `${execution.executionId}`,
                        execution.taskExecutionStatus,
                        execution.taskName,
                        execution.executionId,
                        this.getIconManager(),
                        execution.externalExecutionId,
                        this.registration));
                })
            );
        return executionNodes;
    }
}
