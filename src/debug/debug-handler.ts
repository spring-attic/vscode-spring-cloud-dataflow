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

import { DebugConfiguration } from 'vscode';
import { DebugProvider } from './debug-provider';
import { ScdfTaskExecutionEntry } from '../service/scdf-model';

export interface DebugHandler {

    attach(): Promise<void>;

}

export class DefaultStreamDebugHandler implements DebugHandler {

    constructor(
        private streamName: string,
        private appName: string,
        private port: number,
        private debugProvider: DebugProvider
    ) {}

    public async attach(): Promise<void> {
        const name = `Debug (Attach) - ${this.streamName} ${this.appName}`;
        const config: DebugConfiguration = {
            type: 'java',
            name: name,
            request: 'attach',
            hostName: "localhost",
            port: this.port
        };
        this.debugProvider.startDebug(config);
    }
}

export class DefaultTaskDebugHandler implements DebugHandler {

    constructor(
        private execution: ScdfTaskExecutionEntry,
        private executionId: number,
        private port: number,
        private debugProvider: DebugProvider
    ) {}

    public async attach(): Promise<void> {
        const name = `Debug (Attach) - ${this.execution.taskName} ${this.executionId}`;
        const config: DebugConfiguration = {
            type: 'java',
            name: name,
            request: 'attach',
            hostName: "localhost",
            port: this.port
        };
        this.debugProvider.startDebug(config);
    }
}
