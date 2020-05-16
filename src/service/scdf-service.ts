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
import { workspace, version } from 'vscode';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import * as FormData from 'form-data';
import {
    ScdfStreamEntry, ScdfAppEntry, ScdfStreamDeploymentEntry, ScdfStreamRuntimeEntry, ScdfStreamLogs, ScdfTaskEntry,
    ScdfTaskExecutionEntry, ScdfJobEntry, ScdfJobExecutionEntry, ScdfStepExecutionEntry, StreamStatusResourceList, ScdfStreamRuntimeApplicationEntry, ScdfStreamRuntimeApplicationInstanceEntry
} from './scdf-model';
import { ServerRegistration } from './server-registration-manager';
import { CONFIG_SCDF_CONNECTION_TRUSTSSL } from '../extension-globals';
import { ServerState } from './server-states-manager';

export class ScdfService {

    private instance: AxiosInstance;

    constructor(private registration: ServerRegistration) {
        const trustssl: boolean = workspace.getConfiguration().get(CONFIG_SCDF_CONNECTION_TRUSTSSL, false);
        this.instance = axios.create({
            auth: registration.credentials,
            timeout: 5000,
            httpsAgent: new https.Agent({
              rejectUnauthorized: !trustssl
            })
          });
    }

    public getStreamDsl(registration: ServerRegistration, streamName: string): Thenable<ScdfStreamEntry> {
        return new Promise(async (resolve, reject) => {
            const response = await this.instance.get(
                registration.url + '/streams/definitions/' + streamName);
            resolve((response.data as ScdfStreamEntry));
        });
    }

    public getStreamDeployment(registration: ServerRegistration, streamName: string): Thenable<ScdfStreamDeploymentEntry> {
        return new Promise(async (resolve, reject) => {
            const response = await this.instance.get(
                registration.url + '/streams/deployments/' + streamName);
            const entry = response.data as ScdfStreamDeploymentEntry;
            // TODO: don't like this manual parsing, can axios do it?
            entry.deploymentProperties = JSON.parse(response.data.deploymentProperties);
            resolve(entry);
            // resolve((response.data as ScdfStreamDeploymentEntry));
        });
    }

    public getStreamRuntime(registration: ServerRegistration, streamName: string): Thenable<ScdfStreamRuntimeEntry[]> {
        return new Promise(async (resolve, reject) => {
            const response = await this.instance.get(
                registration.url + '/runtime/streams?names=' + streamName);

            let entries: ScdfStreamRuntimeEntry[] = [];
            if (response.data._embedded && response.data._embedded.streamStatusResourceList) {
                const list1: StreamStatusResourceList[] = response.data._embedded.streamStatusResourceList;
                list1.forEach(streamStatusResourceList => {
                    const applications: ScdfStreamRuntimeApplicationEntry[] = [];
                    streamStatusResourceList.applications._embedded.appStatusResourceList.forEach(appStatusResourceList => {
                        const list2: ScdfStreamRuntimeApplicationInstanceEntry[] = [];
                        appStatusResourceList.instances._embedded.appInstanceStatusResourceList.forEach(appInstanceStatusResourceList => {
                            const entry3: ScdfStreamRuntimeApplicationInstanceEntry = {
                                guid: appInstanceStatusResourceList.guid,
                                id: appInstanceStatusResourceList.instanceId,
                                state: appInstanceStatusResourceList.state
                            };
                            list2.push(entry3);
                        });
                        const entry2: ScdfStreamRuntimeApplicationEntry = {
                            id: appStatusResourceList.deploymentId,
                            name: appStatusResourceList.name,
                            instances: list2
                        };
                        applications.push(entry2);
                    });
                    const entry1: ScdfStreamRuntimeEntry = {
                        name: streamStatusResourceList.name,
                        version: streamStatusResourceList.version,
                        applications: applications
                    };
                    entries.push(entry1);
                });
            } else {
                entries = response.data;
            }
            resolve(entries);
        });
    }

    public getStreams(registration: ServerRegistration): Thenable<ScdfStreamEntry[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.instance.get(registration.url + '/streams/definitions?page=0&size=1000');
                const data = (response.data._embedded &&
                    response.data._embedded.streamDefinitionResourceList) || [];
                resolve((data as ScdfStreamEntry[]));
            }
            catch (error) {
                resolve(([] as ScdfStreamEntry[]));
            }
        });
    }

    public getTasks(registration: ServerRegistration): Thenable<ScdfTaskEntry[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.instance.get(registration.url + '/tasks/definitions?page=0&size=1000');
                const data = (response.data._embedded &&
                    response.data._embedded.taskDefinitionResourceList) || [];
                resolve((data as ScdfTaskEntry[]));
            }
            catch (error) {
                resolve(([] as ScdfTaskEntry[]));
            }
        });
    }

    public getTaskExecutions(registration: ServerRegistration, taskName: string): Thenable<ScdfTaskExecutionEntry[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.instance.get(registration.url + '/tasks/executions?name=' + taskName);
                const data = (response.data._embedded &&
                    response.data._embedded.taskExecutionResourceList) || [];
                resolve((data as ScdfTaskExecutionEntry[]));
            }
            catch (error) {
                resolve(([] as ScdfTaskExecutionEntry[]));
            }
        });
    }

    public getTaskExecution(registration: ServerRegistration, executionId: number): Thenable<ScdfTaskExecutionEntry> {
        return new Promise(async (resolve, reject) => {
                const response = await this.instance.get(registration.url + '/tasks/executions/' + executionId);
                resolve((response.data as ScdfTaskExecutionEntry));
        });
    }

    public deleteTaskExecution(registration: ServerRegistration, executionId: number): Thenable<void> {
        return new Promise(async (resolve, reject) => {
                await this.instance.delete(registration.url + '/tasks/executions/' + executionId + '?action=REMOVE_DATA');
                resolve();
        });
    }

    public getJobs(registration: ServerRegistration): Thenable<ScdfJobEntry[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.instance.get(registration.url + '/jobs/thinexecutions?page=0&size=1000');
                const data = (response.data._embedded &&
                    response.data._embedded.jobExecutionThinResourceList) || [];
                resolve((data as ScdfJobEntry[]));
            }
            catch (error) {
                resolve(([] as ScdfJobEntry[]));
            }
        });
    }

    public getJobExecution(registration: ServerRegistration, executionId: number): Thenable<ScdfJobExecutionEntry> {
        return new Promise(async (resolve, reject) => {
                const response = await this.instance.get(registration.url + '/jobs/executions/' + executionId);
                resolve((response.data as ScdfJobExecutionEntry));
        });
    }

    public getStepExecution(registration: ServerRegistration, jobExecutionId: number, stepExecutionId: number): Thenable<ScdfStepExecutionEntry> {
        return new Promise(async (resolve, reject) => {
                const response = await this.instance.get(registration.url + '/jobs/executions/' + jobExecutionId + '/steps/' + stepExecutionId);
                resolve((response.data as ScdfStepExecutionEntry));
        });
    }

    public getApps(registration: ServerRegistration): Thenable<ScdfAppEntry[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.instance.get(registration.url + '/apps?page=0&size=1000');
                const data = (response.data._embedded &&
                    response.data._embedded.appRegistrationResourceList) || [];
                resolve((data as ScdfAppEntry[]));
            }
            catch (error) {
                resolve(([] as ScdfAppEntry[]));
            }
        });
    }

    public registerApps(registration: ServerRegistration, uris: string[]): Thenable<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // https://github.com/axios/axios/issues/318
                const formData = new FormData();
                formData.append('force', 'false');
                formData.append('apps', uris.join('\n'));
                await this.instance.post(registration.url + '/apps', formData, {
                    headers: formData.getHeaders(),
                });
                resolve();
            }
            catch (error) {
                resolve();
            }
        });
    }

    public registerApp(registration: ServerRegistration, type: string, name: string, uri: string, metadataUri: string): Thenable<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.instance.post(registration.url + '/apps/' + type + '/' + name, {}, {
                    params: {
                        uri: uri,
                        force: false,
                        'metadata-uri': metadataUri
                    }
                });
                resolve();
            }
            catch (error) {
                resolve();
            }
        });
    }

    public unregisterApp(registration: ServerRegistration, type: string, name: string, version?: string): Thenable<void> {
        return new Promise(async (resolve, reject) => {
            try {
                let url = registration.url + '/apps/' + type + '/' + name;
                if (version) {
                    url = url + '/' + version;
                }
                await this.instance.delete(url);
                resolve();
            }
            catch (error) {
                resolve();
            }
        });
    }

    public defaultApp(registration: ServerRegistration, type: string, name: string, version: string): Thenable<void> {
        return new Promise(async (resolve, reject) => {
            try {
                let url = registration.url + '/apps/' + type + '/' + name + '/' + version;
                await this.instance.put(url);
                resolve();
            }
            catch (error) {
                resolve();
            }
        });
    }

    public streamLogs(registration: ServerRegistration, streamName: string, appName?: string): Thenable<ScdfStreamLogs> {
        return new Promise(async (resolve, reject) => {
            try {
                let url = registration.url + '/streams/logs/' + streamName;
                if (appName) {
                    url = url + '/' + appName;
                }
                const response = await this.instance.get(url);
                resolve(response.data as ScdfStreamLogs);
            }
            catch (error) {
                resolve();
            }
        });
    }

    public taskLogs(registration: ServerRegistration, externalExecutionId: string): Thenable<string> {
        return new Promise(async (resolve, reject) => {
            try {
                let url = registration.url + '/tasks/logs/' + externalExecutionId;
                const response = await this.instance.get(url);
                resolve(response.data as string);
            }
            catch (error) {
                resolve();
            }
        });
    }

    public serverState(): Thenable<ServerState> {
        return new Promise(async (resolve, reject) => {
            try {
                let url = this.registration.url + '/about';
                const response = await this.instance.get(url);
                if (response.data) {
                    resolve(ServerState.Online);
                } else {
                    resolve(ServerState.Offline);
                }
            }
            catch (error) {
                resolve(ServerState.Offline);
            }
        });
    }

    public about(): Thenable<string> {
        return new Promise(async (resolve, reject) => {
            try {
                let url = this.registration.url + '/about';
                const response = await this.instance.get(url);
                resolve(response.data as string);
            }
            catch (error) {
                resolve();
            }
        });
    }

    public getApp(type: string, name: string, version: string): Thenable<string> {
        return new Promise(async (resolve, reject) => {
            try {
                let url = this.registration.url + '/apps/' + type + '/' + name + '/' + version;
                const response = await this.instance.get(url);
                resolve(response.data as string);
            }
            catch (error) {
                resolve();
            }
        });
    }
}
