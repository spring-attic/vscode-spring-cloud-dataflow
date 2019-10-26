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
import { InstanceNode } from "./instance-node";
import { ScdfStreamRuntimeApplicationInstanceEntry } from "../../service/scdf-model";
import { ServerRegistration } from "../../service/server-registration-manager";

export class RuntimeNode extends BaseNode {

    constructor(
        label: string,
        public readonly streamName: string,
        public readonly appName: string,
        iconManager: IconManager,
        private readonly instances: ScdfStreamRuntimeApplicationInstanceEntry[],
        public readonly registration: ServerRegistration
    ) {
        super(label, undefined, iconManager, 'runningStreamApp');
    }

    public async getChildren(element: BaseNode): Promise<BaseNode[]> {
        return this.getInstanceNodes();
    }

    protected getThemedIconPath(): ThemedIconPath {
        return this.getIconManager().getThemedIconPath('stream');
    }

    private async getInstanceNodes(): Promise<InstanceNode[]> {
        const instanceNodes: InstanceNode[] = [];
        this.instances.forEach(instance => {
            instanceNodes.push(new InstanceNode(
                instance.id,
                this.streamName,
                this.appName,
                this.getIconManager(),
                this.registration));
        });
        return instanceNodes;
    }
}
