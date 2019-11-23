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
import 'reflect-metadata';
import { ExtensionContext } from 'vscode';
import { Container } from 'inversify';
import {
    LanguageSupport, LanguageServerManager, NotificationManager, StatusBarManagerItem, StatusBarManager,
    ExtensionActivateAware
} from '@pivotal-tools/vscode-extension-core';
import { DITYPES, DiExtension } from '@pivotal-tools/vscode-extension-di';
import { TYPES } from './types';
import commandsContainerModule from './commands/di.config';
import debugContainerModule from './debug/di.config';
import { ScdfLanguageSupport } from './language/scdf-language-support';
import { AppsExplorerProvider } from './explorer/apps-explorer-provider';
import { StreamsExplorerProvider } from './explorer/streams-explorer-provider';
import { TasksExplorerProvider } from './explorer/tasks-explorer-provider';
import { ServerRegistrationStatusBarManagerItem } from './statusbar/server-registration-status-bar-manager-item';
import { ServerRegistrationManager } from './service/server-registration-manager';
import { JobsExplorerProvider } from './explorer/jobs-explorer-provider';
import { CONFIG_SCDF_NOTIFICATION_LOCATION, CONFIG_SCDF_LS_JAVAHOME } from './extension-globals';

export class ScdfExtension extends DiExtension {

    constructor(
        context: ExtensionContext
    ){
        super(context, new Container());
    }

    public onDeactivate(context: ExtensionContext): void {
        super.onDeactivate(context);
    }

    public onContainer(container: Container): void {
        super.onContainer(container);
        container.load(debugContainerModule);
        container.load(commandsContainerModule);

        container.bind<string>(DITYPES.NotificationManagerLocationKey).toConstantValue(CONFIG_SCDF_NOTIFICATION_LOCATION);
        container.bind<string>(DITYPES.JavaFinderJavaHomeKey).toConstantValue(CONFIG_SCDF_LS_JAVAHOME);

        container.bind<LanguageSupport>(DITYPES.LanguageSupport).to(ScdfLanguageSupport);
        container.bind<AppsExplorerProvider>(TYPES.AppsExplorerProvider).to(AppsExplorerProvider).inSingletonScope();
        container.bind<StreamsExplorerProvider>(TYPES.StreamsExplorerProvider).to(StreamsExplorerProvider).inSingletonScope();
        container.bind<TasksExplorerProvider>(TYPES.TasksExplorerProvider).to(TasksExplorerProvider).inSingletonScope();
        container.bind<JobsExplorerProvider>(TYPES.JobsExplorerProvider).to(JobsExplorerProvider).inSingletonScope();

        // bind and then bind again with different type as there might be multiple items
        container.bind<StatusBarManagerItem>(TYPES.ServerRegistrationStatusBarManagerItem).to(ServerRegistrationStatusBarManagerItem).inSingletonScope();
        const serverRegistrationStatusBarManagerItem = container.get<ServerRegistrationStatusBarManagerItem>(TYPES.ServerRegistrationStatusBarManagerItem);
        container.bind<StatusBarManagerItem>(DITYPES.StatusBarManagerItem).toConstantValue(serverRegistrationStatusBarManagerItem);

        const serverRegistrationManager = container.get<ServerRegistrationManager>(TYPES.ServerRegistrationManager);
        container.bind<ExtensionActivateAware>(DITYPES.ExtensionActivateAware).toConstantValue(serverRegistrationManager);

        // to fire build flow
        container.get<AppsExplorerProvider>(TYPES.AppsExplorerProvider);
        container.get<StreamsExplorerProvider>(TYPES.StreamsExplorerProvider);
        container.get<TasksExplorerProvider>(TYPES.TasksExplorerProvider);
        container.get<JobsExplorerProvider>(TYPES.JobsExplorerProvider);
        container.get<NotificationManager>(DITYPES.NotificationManager);
        container.get<StatusBarManager>(DITYPES.StatusBarManager);

        // TODO: for now do this manually here until we have lifycycle hooks
        const lsm = container.get<LanguageServerManager>(DITYPES.LanguageServerManager);
        lsm.start().then();
    }
}
