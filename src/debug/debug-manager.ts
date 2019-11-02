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
import { injectable, multiInject } from 'inversify';
import { ServerRegistration } from '../service/server-registration-manager';
import { DebugHandler, DefaultStreamDebugHandler, DefaultTaskDebugHandler } from './debug-handler';
import { TYPES } from '../types';
import { DebugProvider } from './debug-provider';
import { ScdfModel } from '../service/scdf-model';

@injectable()
export class DebugManager {

    constructor(
        @multiInject(TYPES.DebugProvider) private debugProviders: DebugProvider[]
    ) {}

    public getTaskDebugHandler(
        executionId: number,
        serverRegistration: ServerRegistration
    ): Thenable<DebugHandler> {
        return new Promise(async (resolve, reject) => {
            let port: number | undefined;
            // TODO: find debug provider which supports our env
            const debugProvider = this.debugProviders[0];

            const model = new ScdfModel(serverRegistration);
            const execution = await model.getTaskExecution(executionId);

            const props = execution.deploymentProperties;
            if (props) {
                const regex = /deployer\.\w+\.local\.debug-port/;
                for (const key in props) {
                    if (key.match(regex)) {
                        const portString = props[key];
                        if (portString) {
                            port = +portString;
                        }
                    break;
                    }
                }
            }
            if (port) {
                resolve(new DefaultTaskDebugHandler(execution, executionId, port, debugProvider));
            } else {
                reject(new Error(`Debug port unknown for task execution ${executionId}`));
            }
        });
    }

    public getStreamDebugHandler(
        streamName: string,
        appType: string,
        serverRegistration: ServerRegistration
    ): Thenable<DebugHandler> {
        return new Promise(async (resolve, reject) => {
            let port: number | undefined;
            // TODO: find debug provider which supports our env
            const debugProvider = this.debugProviders[0];
            const model = new ScdfModel(serverRegistration);
            const deployment = model.getStreamDeployment(streamName);
            const entry = await deployment;
            const props = entry.deploymentProperties[appType];
            if (props) {
                const portString = props['spring.cloud.deployer.local.debug-port'];
                if (portString) {
                    port = +portString;
                }
            }
            if (port) {
                resolve(new DefaultStreamDebugHandler(streamName, appType, port, debugProvider));
            } else {
                reject(new Error(`Debug port unknown for app ${appType}`));
            }
        });
    }

}
