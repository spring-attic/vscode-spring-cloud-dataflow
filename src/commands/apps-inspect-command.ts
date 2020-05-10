/*
 * Copyright 2020 the original author or authors.
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
import { COMMAND_SCDF_APPS_INSPECT } from '../extension-globals';
import { AppVersionNode } from '../explorer/models/app-version-node';
import { ReadOnlyDocumentManager } from '@pivotal-tools/vscode-extension-core';
import { ServerRegistration } from '../service/server-registration-manager';
import { ScdfModel } from '../service/scdf-model';

@injectable()
export class AppsInspectCommand implements Command {

    constructor(
        @inject(DITYPES.ReadOnlyDocumentManager) private readOnlyDocumentManager: ReadOnlyDocumentManager
    ) {}

    get id() {
        return COMMAND_SCDF_APPS_INSPECT;
    }

    async execute(appNode: AppVersionNode) {
        const server: ServerRegistration = appNode.registration;
        const model = new ScdfModel(server);
        const data = await model.getApp(appNode.type, appNode.name, appNode.version);
        const node = {label: `${appNode.name}.${appNode.label}`, fullId: `${appNode.type}.${appNode.name}.${appNode.label}`};
        await this.readOnlyDocumentManager.openReadOnlyJson(node, data);
    }
}
