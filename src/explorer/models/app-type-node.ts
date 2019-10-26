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
import { ScdfModel, ScdfAppEntry } from "../../service/scdf-model";
import { AppNode } from "./app-node";
import { ServerRegistration } from "../../service/server-registration-manager";

/**
 * Enumeration of a possible app types in a dataflow. These are hardcoded
 * application types used in a dataflow.
 */
export enum AppType {
    App = 'app',
    Source = 'source',
    Processor = 'processor',
    Sink = 'sink',
    Task = 'task'
}

/**
 * Node representing an {@link AppType} type in an explorer tree.
 */
export class AppTypeNode extends BaseNode {

    constructor(
        label: string,
        description: string | undefined,
        iconManager: IconManager,
        private readonly type: AppType,
        private childData: Map<string, Map<string, ScdfAppEntry>>
    ) {
        super(label, description, iconManager);
    }

    public async getChildren(element: BaseNode): Promise<BaseNode[]> {
        return this.getAppNodes(this.type);
    }

    protected getThemedIconPath(): ThemedIconPath {
        switch (this.type) {
            case AppType.App:
                return this.getIconManager().getThemedIconPath('app');
            case AppType.Source:
                return this.getIconManager().getThemedIconPath('source');
            case AppType.Processor:
                return this.getIconManager().getThemedIconPath('processor');
            case AppType.Sink:
                return this.getIconManager().getThemedIconPath('sink');
            case AppType.Task:
                return this.getIconManager().getThemedIconPath('task');
            default:
                return super.getThemedIconPath();
        }
    }

    private async getAppNodes(type: AppType): Promise<AppNode[]> {
        const nodes: AppNode[] = [];
        this.childData.forEach((v, k) => {
            nodes.push(new AppNode(k, v.size.toString(), this.getIconManager(), type, v));
        });
        return nodes;
    }
}
