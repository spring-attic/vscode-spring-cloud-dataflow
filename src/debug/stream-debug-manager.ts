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
import { DebugConfiguration, debug } from 'vscode';
import { injectable } from 'inversify';
import { InstanceNode } from '../explorer/models/instance-node';
import { ScdfModel } from '../service/scdf-model';
import { ExecutionNode } from '../explorer/models/execution-node';

@injectable()
export class StreamDebugManager {

    public async streamAppInstanceDebugConfiguration(streamAppInstance: InstanceNode): Promise<DebugConfiguration> {
        const model = new ScdfModel(streamAppInstance.registration);
        const deployment = model.getStreamDeployment(streamAppInstance.streamName);
        const entry = await deployment;
        const name = `Debug (Attach) - ${streamAppInstance.streamName} ${streamAppInstance.appName}`;
        const port = +entry.deploymentProperties.log['spring.cloud.deployer.local.debug-port'];
        const config: DebugConfiguration = {
            type: 'java',
            name: name,
            request: 'attach',
            hostName: "localhost",
            port: port
        };
        return config;
    }

    public async taskExecutionNodeDebugConfiguration(executedTaskInstance: ExecutionNode): Promise<DebugConfiguration> {
        const model = new ScdfModel(executedTaskInstance.registration);
        // const deployment = model.getStreamDeployment(executedTaskInstance.taskName);
        // const entry = await deployment;
        const name = `Debug (Attach) - ${executedTaskInstance.taskName} ${executedTaskInstance.externalExecutionId}`;
        // const port = +entry.deploymentProperties.log['spring.cloud.deployer.local.debug-port'];
        // TODO: just hardcode until we get these exposed from dataflow
        const port = 20100;
        const config: DebugConfiguration = {
            type: 'java',
            name: name,
            request: 'attach',
            hostName: "localhost",
            port: port
        };
        return config;
    }
    public launchDebug(configs: DebugConfiguration[]): void {
        configs.forEach(config => {
            debug.startDebugging(undefined, config);
        });
    }
}
