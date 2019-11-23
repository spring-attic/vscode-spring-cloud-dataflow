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
import { Uri } from 'vscode';
import { ScdfService } from './scdf-service';
import { ServerRegistration } from './server-registration-manager';
import { ServerState } from './server-states-manager';

export interface BaseEntry {
    _links: {self: Uri};
}

export interface ScdfAppEntry extends BaseEntry {
    defaultVersion: boolean;
    name: string;
    type: string;
    uri: string;
    version: string;
}

export interface ScdfStreamEntry extends BaseEntry {
    name: string;
    dslText: string;
    status: string;
    statusDescription: string;
}

export interface ScdfTaskEntry extends BaseEntry {
    name: string;
    dslText: string;
    description: string;
    composed: boolean;
    lastTaskExecution: string;
    status: string;
}

export interface ScdfTaskExecutionEntry extends BaseEntry {
    arguments: string[];
    endTime: string;
    errorMessage: string;
    executionId: number;
    exitCode: number;
    exitMessage: string;
    externalExecutionId: string;
    jobExecutionIds: number[];
    parentExecutionId: number;
    startTime: string;
    deploymentProperties: DeploymentProperties;
    taskExecutionStatus: string;
    taskName: string;
}

export interface ScdfJobEntry extends BaseEntry {
    executionId: number;
    instanceId: number;
    jobId: number;
    name: string;
    status: string;
}

export interface JobExecution {
    stepExecutions: StepExecution[];
}

export interface StepExecution {
    id: number;
    stepName: string;
    status: string;
}

export interface ScdfJobExecutionEntry extends BaseEntry {
    executionId: number;
    jobId: number;
    name: string;
    jobExecution: JobExecution;
}

export interface ScdfStepExecutionEntry extends BaseEntry {
    jobExecutionId: number;
    stepExecution: StepExecution;
    stepType: string;
}

interface DeploymentProperties {
    [key: string]: string;
}

interface DeploymentApps {
    [key: string]: DeploymentProperties;
}

export interface ScdfStreamDeploymentEntry extends BaseEntry {
    streamName: string;
    dslText: string;
    description: string;
    status: string;
    deploymentProperties: DeploymentApps;
}

export interface ScdfNode {
    name: string;
    resource: Uri;
}

export interface ScdfStreamRuntimeEntry {
    name: string;
    version: string;
    applications: ScdfStreamRuntimeApplicationEntry[];
}

export interface ScdfStreamRuntimeApplicationEntry {
    id: string;
    name: string;
    instances: ScdfStreamRuntimeApplicationInstanceEntry[];
}

export interface ScdfStreamRuntimeApplicationInstanceEntry {
    guid: string;
    id: string;
    index: number;
    properties: any;
    state: string;
}

export interface ScdfStreamLogs {
    logs: {[key: string]: string};
}

export class ScdfModel {

    private scdfService: ScdfService;

    constructor(readonly registration: ServerRegistration) {
        this.scdfService = new ScdfService(registration);
    }

    public getApps(): Thenable<ScdfAppEntry[]> {
        return this.scdfService.getApps(this.registration);
    }

    public getStreams(): Thenable<ScdfStreamEntry[]> {
        return this.scdfService.getStreams(this.registration);
    }

    public getStreamDsl(streamName: string): Thenable<string> {
        return new Promise((resolve, reject) => {
            resolve(this.scdfService.getStreamDsl(this.registration, streamName)
                .then(stream => stream.dslText));
        });
    }

    public getStreamDeployment(streamName: string): Thenable<ScdfStreamDeploymentEntry> {
        return this.scdfService.getStreamDeployment(this.registration, streamName);
    }

    public getStreamRuntime(streamName: string): Thenable<ScdfStreamRuntimeEntry[]> {
        return this.scdfService.getStreamRuntime(this.registration, streamName);
    }

    public getTasks(): Thenable<ScdfTaskEntry[]> {
        return this.scdfService.getTasks(this.registration);
    }

    public getTaskExecutions(streamName: string): Thenable<ScdfTaskExecutionEntry[]> {
        return this.scdfService.getTaskExecutions(this.registration, streamName);
    }

    public getTaskExecution(executionId: number): Thenable<ScdfTaskExecutionEntry> {
        return this.scdfService.getTaskExecution(this.registration, executionId);
    }

    public deleteTaskExecution(executionId: number): Thenable<void> {
        return this.scdfService.deleteTaskExecution(this.registration, executionId);
    }

    public getJobs(): Thenable<ScdfJobEntry[]> {
        return this.scdfService.getJobs(this.registration);
    }

    public getJobExecution(executionId: number): Thenable<ScdfJobExecutionEntry> {
        return this.scdfService.getJobExecution(this.registration, executionId);
    }

    public getStepExecution(jobExecutionId: number, stepExecutionId: number): Thenable<ScdfStepExecutionEntry> {
        return this.scdfService.getStepExecution(this.registration, jobExecutionId, stepExecutionId);
    }

    public registerApps(uris: string[]): Thenable<void> {
        return this.scdfService.registerApps(this.registration, uris);
    }

    public registerApp(type: string, name: string, uri: string, metadataUri: string): Thenable<void> {
        return this.scdfService.registerApp(this.registration, type, name, uri, metadataUri);
    }

    public unregisterApp(type: string, name: string, version?: string): Thenable<void> {
        return this.scdfService.unregisterApp(this.registration, type, name, version);
    }

    public defaultApp(type: string, name: string, version: string): Thenable<void> {
        return this.scdfService.defaultApp(this.registration, type, name, version);
    }

    public streamLogs(streamName: string, appName?: string): Thenable<ScdfStreamLogs> {
        return this.scdfService.streamLogs(this.registration, streamName, appName);
    }

    public taskLogs(externalExecutionId: string): Thenable<string> {
        return this.scdfService.taskLogs(this.registration, externalExecutionId);
    }

    public serverState(): Thenable<ServerState> {
        return this.scdfService.serverState();
    }
}
