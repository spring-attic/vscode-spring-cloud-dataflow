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

export interface DeploymentProperties {
    [key: string]: string;
}

export interface DataflowStreamParams {
    name: string;
    server?: string;
}

export interface DataflowStreamCreateParams extends DataflowStreamParams {
    description: string;
    definition: string;
}

export interface DataflowStreamDeployParams extends DataflowStreamParams {
    properties?: DeploymentProperties;
}

export interface DataflowStreamUndeployParams extends DataflowStreamParams {
}

export interface DataflowStreamDestroyParams extends DataflowStreamParams {
}

export interface DataflowTaskParams {
    name: string;
    server: string;
}

export interface DataflowTaskCreateParams extends DataflowTaskParams {
    description: string;
    definition: string;
}

export interface DataflowTaskLaunchParams extends DataflowTaskParams {
    properties?: DeploymentProperties;
    arguments?: string[];
}

export interface DataflowTaskDestroyParams extends DataflowTaskParams {
}
