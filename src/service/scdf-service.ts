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
import axios from 'axios';
import * as FormData from 'form-data';
import {
    ScdfStreamEntry, ScdfAppEntry, ScdfStreamDeploymentEntry, ScdfStreamRuntimeEntry, ScdfStreamLogs, ScdfTaskEntry,
    ScdfTaskExecutionEntry, ScdfJobEntry, ScdfJobExecutionEntry, ScdfStepExecutionEntry
} from './scdf-model';
import { ServerRegistration } from './server-registration-manager';

export class ScdfService {

    public getStreamDsl(registration: ServerRegistration, streamName: string): Thenable<ScdfStreamEntry> {
        return new Promise(async (resolve, reject) => {
            const response = await axios.get(
                registration.url + '/streams/definitions/' + streamName, {
                    auth: registration.credentials
            });
            resolve((response.data as ScdfStreamEntry));
        });
    }

    public getStreamDeployment(registration: ServerRegistration, streamName: string): Thenable<ScdfStreamDeploymentEntry> {
        return new Promise(async (resolve, reject) => {
            const response = await axios.get(
                registration.url + '/streams/deployments/' + streamName, {
                    auth: registration.credentials
            });
            const entry = response.data as ScdfStreamDeploymentEntry;
            // TODO: don't like this manual parsing, can axios do it?
            entry.deploymentProperties = JSON.parse(response.data.deploymentProperties);
            resolve(entry);
            // resolve((response.data as ScdfStreamDeploymentEntry));
        });
    }

    public getStreamRuntime(registration: ServerRegistration, streamName: string): Thenable<ScdfStreamRuntimeEntry[]> {
        return new Promise(async (resolve, reject) => {
            const response = await axios.get(
                registration.url + '/runtime/streams?names=' + streamName, {
                    auth: registration.credentials
            });
            resolve((response.data as ScdfStreamRuntimeEntry[]));
        });
    }

    public getStreams(registration: ServerRegistration): Thenable<ScdfStreamEntry[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(registration.url + '/streams/definitions?page=0&size=1000', {
                    auth: registration.credentials
                });
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
                const response = await axios.get(registration.url + '/tasks/definitions?page=0&size=1000', {
                    auth: registration.credentials
                });
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
                const response = await axios.get(registration.url + '/tasks/executions?name=' + taskName, {
                    auth: registration.credentials
                });
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
                const response = await axios.get(registration.url + '/tasks/executions/' + executionId, {
                    auth: registration.credentials
                });
                resolve((response.data as ScdfTaskExecutionEntry));
        });
    }

    public getJobs(registration: ServerRegistration): Thenable<ScdfJobEntry[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(registration.url + '/jobs/thinexecutions?page=0&size=1000', {
                    auth: registration.credentials
                });
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
                const response = await axios.get(registration.url + '/jobs/executions/' + executionId, {
                    auth: registration.credentials
                });
                resolve((response.data as ScdfJobExecutionEntry));
        });
    }

    public getStepExecution(registration: ServerRegistration, jobExecutionId: number, stepExecutionId: number): Thenable<ScdfStepExecutionEntry> {
        return new Promise(async (resolve, reject) => {
                const response = await axios.get(registration.url + '/jobs/executions/' + jobExecutionId + '/steps/' + stepExecutionId, {
                    auth: registration.credentials
                });
                resolve((response.data as ScdfStepExecutionEntry));
        });
    }

    public getApps(registration: ServerRegistration): Thenable<ScdfAppEntry[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(registration.url + '/apps?page=0&size=1000', {
                    auth: registration.credentials
                });
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
                await axios.post(registration.url + '/apps', formData, {
                    headers: formData.getHeaders(),
                    auth: registration.credentials
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
                await axios.post(registration.url + '/apps/' + type + '/' + name, {}, {
                    params: {
                        uri: uri,
                        force: false,
                        'metadata-uri': metadataUri
                    },
                    auth: registration.credentials
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
                await axios.delete(url, {
                    auth: registration.credentials
                });
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
                await axios.put(url, {
                    auth: registration.credentials
                });
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
                const response = await axios.get(url, {
                    auth: registration.credentials
                });
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
                const response = await axios.get(url, {
                    auth: registration.credentials
                });
                resolve(response.data as string);
            }
            catch (error) {
                resolve();
            }
        });
    }
}
