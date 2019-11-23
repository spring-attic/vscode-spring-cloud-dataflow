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
import { ScdfModel, ScdfAppEntry } from '../../service/scdf-model';
import { StreamNode } from './stream-node';
import { AppTypeNode, AppType } from './app-type-node';
import { ServerRegistration } from '../../service/server-registration-manager';
import { TaskNode } from './task-node';
import { JobNode } from './job-node';
import { ServerState } from '../../service/server-states-manager';
import { CONFIG_SCDF_SERVER_STATECHECK } from '../../extension-globals';
import { workspace } from 'vscode';

/**
 * Enumeration of a possible child types under server in a dataflow. Mostly following web
 * UI for things like apps, streams, etc.
 */
export enum ServerMode {
    Apps = 'apps',
    Streams = 'streams',
    Tasks = 'tasks',
    Jobs = 'jobs'
}

/**
 * Node representing an dataflow individual server registration in an explorer tree.
 */
export class ServerNode extends BaseNode {

    constructor(
        iconManager: IconManager,
        public readonly registration: ServerRegistration,
        public readonly mode: ServerMode,
        public readonly state: ServerState
    ) {
        super(registration.name, registration.url, iconManager, 'serverRegistration');
    }

    public async getChildren(element: BaseNode): Promise<BaseNode[]> {
        switch (this.mode) {
            case ServerMode.Apps:
                return this.getAppTypeNodes();
            case ServerMode.Streams:
                return this.getStreamNodes();
            case ServerMode.Tasks:
                return this.getTaskNodes();
            case ServerMode.Jobs:
                return this.getJobNodes();
            default:
                return super.getChildren(element);
        }
    }

    protected getThemedIconPath(): ThemedIconPath {
        let icon: string = 'server';
        const stateCheck = workspace.getConfiguration().get<string>(CONFIG_SCDF_SERVER_STATECHECK, 'icon');
        if (stateCheck === 'icon') {
            if (this.state === ServerState.Online) {
                icon = 'server';
            } else if (this.state === ServerState.Offline) {
                icon = 'server_offline';
            }
        } else if (stateCheck === 'color') {
            if (this.state === ServerState.Online) {
                icon = 'server_green';
            } else if (this.state === ServerState.Offline) {
                icon = 'server_red';
            }
        }
        return this.getIconManager().getThemedIconPath(icon);
    }

    private async getAppTypeNodes(): Promise<AppTypeNode[]> {
        return this.getAppTypeNodesMap()
            .then(appTypes => {
                let nodes: AppTypeNode[] = [];
                appTypes.forEach((v, k) => {
                    const name = k.toString();
                    const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
                    nodes.push(new AppTypeNode(nameCapitalized, v.size.toString(), this.getIconManager(), k, v));
                });
                return nodes;
            });
    }

    private async getAppTypeNodesMap(): Promise<Map<AppType, Map<string, Map<string, ScdfAppEntry>>>> {
        const stringToEnumValue = <ET, T>(enumObj: ET, str: string): T =>
            (enumObj as any)[Object.keys(enumObj).filter(k => (enumObj as any)[k] === str)[0]];
        const model = new ScdfModel(this.registration);
        return model.getApps()
            .then(apps => {
                // populate main types
                const appTypeMap = new Map<AppType, Map<string, Map<string, ScdfAppEntry>>>();
                appTypeMap.set(AppType.App, new Map<string, Map<string, ScdfAppEntry>>());
                appTypeMap.set(AppType.Source, new Map<string, Map<string, ScdfAppEntry>>());
                appTypeMap.set(AppType.Processor, new Map<string, Map<string, ScdfAppEntry>>());
                appTypeMap.set(AppType.Sink, new Map<string, Map<string, ScdfAppEntry>>());
                appTypeMap.set(AppType.Task, new Map<string, Map<string, ScdfAppEntry>>());
                // build named types and versions
                apps.forEach(app => {
                    const appType = stringToEnumValue<typeof AppType, AppType>(AppType, app.type);
                    let appTypeNameMap = appTypeMap.get(appType);
                    if (appTypeNameMap) {
                        let appTypeNameVersionMap = appTypeNameMap.get(app.name);
                        if (!appTypeNameVersionMap) {
                            appTypeNameVersionMap = new Map<string, ScdfAppEntry>();
                            appTypeNameMap.set(app.name, appTypeNameVersionMap);
                        }
                        appTypeNameVersionMap.set(app.version, app);
                    }

                });
                return appTypeMap;
            });
    }

    private async getStreamNodes(): Promise<StreamNode[]> {
        const scdfModel = new ScdfModel(this.registration);
        const serverId = this.registration.name;
        return scdfModel.getStreams().then(streams =>
            streams.map(app =>
                new StreamNode(
                    app.name,
                    app.status,
                    app.name,
                    app.status,
                    this.getIconManager(),
                    serverId,
                    this.registration)));
    }

    private async getTaskNodes(): Promise<TaskNode[]> {
        const scdfModel = new ScdfModel(this.registration);
        const serverId = this.registration.name;
        return scdfModel.getTasks().then(tasks =>
            tasks.map(app =>
                new TaskNode(
                    app.name,
                    app.status,
                    app.name,
                    this.getIconManager(),
                    serverId,
                    this.registration)));
    }

    private async getJobNodes(): Promise<JobNode[]> {
        const scdfModel = new ScdfModel(this.registration);
        return scdfModel.getJobs().then(jobs =>
            jobs.map(job =>
                new JobNode(
                    job.executionId.toString(),
                    `${job.name} ${job.status}`,
                    this.getIconManager(),
                    this.registration,
                    job.executionId,
                    job.name)));
    }
}
