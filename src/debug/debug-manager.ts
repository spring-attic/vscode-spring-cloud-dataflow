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
import { DefaultStreamDebugHandler, DebugHandler, DefaultTaskDebugHandler } from './debug-handler';
import { TYPES } from '../types';
import { DebugProvider } from './debug-provider';

@injectable()
export class DebugManager {

    constructor(
        @multiInject(TYPES.DebugProvider) private debugProviders: DebugProvider[]
    ) {}

    public getStreamDebugHandler(
        streamName: string,
        appName: string,
        serverRegistration: ServerRegistration
    ): DebugHandler {
        // find debug provider which supports our env
        const debugProvider = this.debugProviders[0];
        return new DefaultStreamDebugHandler(serverRegistration, streamName, appName, debugProvider);
    }

    public getTaskDebugHandler(
        executionId: number,
        serverRegistration: ServerRegistration
    ): DebugHandler {
        // find debug provider which supports our env
        const debugProvider = this.debugProviders[0];
        return new DefaultTaskDebugHandler(serverRegistration, executionId, debugProvider);
    }
}
