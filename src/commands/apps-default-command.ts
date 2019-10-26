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
import { COMMAND_SCDF_APPS_DEFAULT } from '../extension-globals';
import { ServerRegistrationManager } from '../service/server-registration-manager';
import { TYPES } from '../types';
import { ScdfModel } from '../service/scdf-model';
import { AppsExplorerProvider } from '../explorer/apps-explorer-provider';

@injectable()
export class AppsDefaultCommand implements Command {

    constructor(
        @inject(TYPES.ServerRegistrationManager) private serverRegistrationManager: ServerRegistrationManager,
        @inject(TYPES.AppsExplorerProvider) private appsExplorerProvider: AppsExplorerProvider
    ) {}

    get id() {
        return COMMAND_SCDF_APPS_DEFAULT;
    }

    async execute(...args: any[]) {
        let resolvedType: string;
        let resolvedName: string;
        let resolvedVersion: string;
        if (args[1]) {
            resolvedType = args[0];
            resolvedName = args[1];
            resolvedVersion = args[2];
        } else {
            resolvedType = args[0].type;
            resolvedName = args[0].name;
            resolvedVersion = args[0].version;
        }

        const defaultServer = await this.serverRegistrationManager.getDefaultServer();
        if (defaultServer) {
            const model = new ScdfModel(defaultServer);
            await model.defaultApp(resolvedType, resolvedName, resolvedVersion);
            this.appsExplorerProvider.refresh();
        }
    }
}
