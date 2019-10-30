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
import { DebugConfiguration, debug, WorkspaceFolder } from 'vscode';
import { injectable } from 'inversify';

export interface DebugProvider {

    getDebugType(): string;

    hasDebugger(): Promise<boolean>;

    startDebug(config: DebugConfiguration): Promise<boolean>;
}

@injectable()
export class LocalDebugProvider implements DebugProvider {

    public getDebugType(): string {
        return 'java';
    }

    public async hasDebugger(): Promise<boolean> {
        return true;
    }

    public async startDebug(config: DebugConfiguration): Promise<boolean> {
        const folder: WorkspaceFolder | undefined = undefined;
        const started = await debug.startDebugging(folder, config);
        return started;
    }
}
