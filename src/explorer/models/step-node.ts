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
import { IconManager, ThemedIconPath } from "@pivotal-tools/vscode-extension-core";
import { BaseNode } from "./base-node";
import { TreeItemCollapsibleState } from "vscode";
import { ServerRegistration } from "../../service/server-registration-manager";

export class StepNode extends BaseNode {

    constructor(
        label: string,
        public readonly description: string | undefined,
        iconManager: IconManager,
        public readonly registration: ServerRegistration,
        public readonly jobExecutionId: number,
        public readonly stepExecutionId: number,
        public readonly stepName: string
    ) {
        super(label, description, iconManager, 'executedStep');
    }

    protected getThemedIconPath(): ThemedIconPath {
        return this.getIconManager().getThemedIconPath('task');
    }

    protected getTreeItemCollapsibleState(): TreeItemCollapsibleState {
        return TreeItemCollapsibleState.None;
    }
}
