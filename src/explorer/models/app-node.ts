/*
 * Copyright 2019-2020 the original author or authors.
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
import { AppType } from "./app-type-node";
import { AppVersionNode } from "./app-version-node";
import { ScdfAppEntry } from "../../service/scdf-model";
import { ServerRegistration } from "../../service/server-registration-manager";

/**
 * Generic node which is any of {@link AppType}.
 */
export class AppNode extends BaseNode {

    constructor(
        label: string,
        description: string | undefined,
        iconManager: IconManager,
        public readonly registration: ServerRegistration,
        private readonly type: AppType,
        private childData: Map<string, ScdfAppEntry>
    ) {
        super(label, description, iconManager, 'definedApp');
    }

    public async getChildren(element: BaseNode): Promise<BaseNode[]> {
        let nodes: AppVersionNode[] = [];
        this.childData.forEach((v, k) => {
            nodes.push(new AppVersionNode(k, v.defaultVersion ? 'default' : undefined, this.getIconManager(), this.registration, this.type, this.label, k));
        });
        return nodes;
    }

    protected getThemedIconPath(): ThemedIconPath {
        return this.getIconManager().getThemedIconPath('appinstance');
    }
}
