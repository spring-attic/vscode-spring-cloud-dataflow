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
import { TreeItemCollapsibleState } from 'vscode';
import { IconManager, ThemedIconPath } from '@pivotal-tools/vscode-extension-core';
import { BaseNode } from './base-node';
import { StepNode } from './step-node';
import { ScdfModel } from '../../service/scdf-model';
import { ServerRegistration } from '../../service/server-registration-manager';

export class JobNode extends BaseNode {

    constructor(
        label: string,
        public readonly description: string | undefined,
        iconManager: IconManager,
        public readonly registration: ServerRegistration,
        public readonly executionId: number,
        public readonly jobName: string
    ) {
        super(label, description, iconManager, 'executedJob');
    }

    protected getThemedIconPath(): ThemedIconPath {
        return this.getIconManager().getThemedIconPath('task');
    }

    public async getChildren(element: BaseNode): Promise<BaseNode[]> {
        return this.getStepNodes();
    }

    private async getStepNodes(): Promise<StepNode[]> {
        const stepNodes: StepNode[] = [];
        const scdfModel = new ScdfModel(this.registration);
        await scdfModel.getJobExecution(this.executionId)
            .then(execution => {
                execution.jobExecution.stepExecutions.forEach(step => {
                    stepNodes.push(new StepNode(
                        step.id.toString(),
                        `${step.stepName} ${step.status}`,
                        this.getIconManager(),
                        this.registration,
                        execution.executionId,
                        step.id,
                        step.stepName));
                });
            });
        return stepNodes;
    }
}
