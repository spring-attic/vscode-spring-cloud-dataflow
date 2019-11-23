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
import {
    TreeView, ExtensionContext, Event, TreeViewVisibilityChangeEvent, window, EventEmitter, workspace
} from 'vscode';
import { injectable, inject } from 'inversify';
import { DITYPES } from '@pivotal-tools/vscode-extension-di';
import { TYPES } from '../types';
import { ServerRegistrationManager } from './server-registration-manager';
import { BaseNode } from '../explorer/models/base-node';
import { ScdfModel } from './scdf-model';
import { CONFIG_SCDF_SERVER_STATEREFRESH, CONFIG_SCDF_SERVER_STATECHECK } from '../extension-globals';

export enum ServerState {
    Online = 'online',
    Offline = 'offline',
    Noauth = 'noauth',
    Unknown = 'unknown'
}

@injectable()
export class ServerStatesManager {

    private states: Map<string, ServerState> = new Map();
    private registrations: Map<string, EventEmitter<BaseNode>> = new Map();
    private intervalId: NodeJS.Timeout | undefined;

    constructor(
        @inject(DITYPES.ExtensionContext) private context: ExtensionContext,
        @inject(TYPES.ServerRegistrationManager) private serverRegistrationManager: ServerRegistrationManager,
    ) {
    }

    public getState(server: string): ServerState {
        const s = this.states.get(server);
        return s || ServerState.Unknown;
    }

    public registerRefreshEvents(viewId: string, treeView: TreeView<BaseNode>, emitter: EventEmitter<BaseNode>): void {
        this.registerEvent(treeView.onDidChangeVisibility, (e: TreeViewVisibilityChangeEvent) => {
            if (e.visible) {
                this.registrations.set(viewId, emitter);
                emitter.fire();
            } else {
                this.registrations.delete(viewId);
            }

            if (this.registrations.size > 0) {
                const stateCheck = workspace.getConfiguration().get<string>(CONFIG_SCDF_SERVER_STATECHECK, 'icon');
                const interval = workspace.getConfiguration().get<number>(CONFIG_SCDF_SERVER_STATEREFRESH, 5);
                if (interval > 0 && stateCheck !== 'none') {
                    this.intervalId = setInterval(async () => {
                        if (window.state.focused) {
                            const servers = await this.serverRegistrationManager.getServers();
                            const stateDifferences = servers.map(async s => {
                                const model = new ScdfModel(s);
                                const newState = await model.serverState();
                                const oldState = this.states.get(s.url);
                                this.states.set(s.url, newState);
                                return oldState !== newState;
                            });
                            Promise.all(stateDifferences).then(results => {
                                if(results.some(x => x)) {
                                    this.registrations.forEach((v, k) => {
                                        v.fire();
                                    });
                                }
                            });
                        }

                    }, interval * 1000);
                }
            } else {
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                }
            }

        });
    }

    private registerEvent<T>(event: Event<T>, callback: (...args: any[]) => any): void {
        const e = event(async (...args: any[]): Promise<any> => {
            return callback(...args);
        });
        this.context.subscriptions.push(e);
    }
}
