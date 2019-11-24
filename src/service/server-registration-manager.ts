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
import { injectable, inject } from 'inversify';
import { SettingsManager, LanguageServerManager, ExtensionActivateAware } from '@pivotal-tools/vscode-extension-core';
import { DITYPES } from '@pivotal-tools/vscode-extension-di';
import { registerServerInput } from '../commands/register-server';
import { BaseNode } from '../explorer/models/base-node';
import { commands, window, ExtensionContext, workspace } from 'vscode';
import { TYPES } from '../types';
import { ServerRegistrationStatusBarManagerItem } from '../statusbar/server-registration-status-bar-manager-item';
import { ServerNode } from '../explorer/models/server-node';
import { CONFIG_SCDF_CONNECTION_TRUSTSSL } from '../extension-globals';

export interface ServerRegistrationNonsensitive {
    url: string;
    name: string;
}

export interface ServerRegistrationCredentials {
    username: string;
    password: string;
}

export interface ServerRegistration extends ServerRegistrationNonsensitive {
    credentials: ServerRegistrationCredentials;
}

export interface DataflowEnvironmentParams {
    environments: ServerRegistration[];
    defaultEnvironment: string;
    trustssl: boolean;
}

@injectable()
export class ServerRegistrationManager implements ExtensionActivateAware {

    private customRegistriesKey2 = 'scdfDefaultServer';
    private customRegistriesKey = 'scdfServers';

    constructor(
        @inject(DITYPES.ExtensionContext) private context: ExtensionContext,
        @inject(DITYPES.SettingsManager) private settingsManager: SettingsManager,
        @inject(DITYPES.LanguageServerManager) private languageServerManager: LanguageServerManager,
        @inject(TYPES.ServerRegistrationStatusBarManagerItem) private serverRegistrationStatusBarManagerItem: ServerRegistrationStatusBarManagerItem
    ) {}

    public async onExtensionActivate(context: ExtensionContext): Promise<void> {
        // if we have a default server, let statusbar know about it
        const registration = await this.getDefaultServer();
        if (registration && registration.name) {
            this.serverRegistrationStatusBarManagerItem.setRegistrationName(registration.name);
        } else {
            this.serverRegistrationStatusBarManagerItem.setRegistrationName(undefined);
        }
        // try {
        //     const registration = await this.getDefaultServer();
        //     this.serverRegistrationStatusBarManagerItem.setRegistrationName(registration.name);
        // } catch (error) {
        //     this.serverRegistrationStatusBarManagerItem.setRegistrationName(undefined);
        // }
    }

    public async notifyServers(): Promise<void> {
        const registrations: ServerRegistration[] = [];
        const servers = await this.getServers();
        servers.forEach(registration => registrations.push(registration));
        const registration = await this.getDefaultServer();
        if (registration) {
            const trustssl = workspace.getConfiguration().get<boolean>(CONFIG_SCDF_CONNECTION_TRUSTSSL) || false;
            const params: DataflowEnvironmentParams = {
                environments: registrations,
                defaultEnvironment: registration.name,
                trustssl: trustssl
            };
            this.languageServerManager.getLanguageClient('scdfs').sendNotification('scdf/environment', params);
        }
    }

    public async connectServer(): Promise<void> {
        let servers = await this.getServers();

        const state = await registerServerInput(this.context);

        let newRegistry: ServerRegistration = {
            url: state.address,
            name: state.name,
            credentials: { username: state.username, password: state.password }
        };

        let sensitive: string = JSON.stringify(newRegistry.credentials);
        let key = this.getUsernamePwdKey(newRegistry.name);
        await this.settingsManager.setSensitive(key, sensitive);
        servers.push(newRegistry);
        await this.saveServerRegistrationNonsensitive(servers);
        await this.refresh();
        await this.notifyServers();
        if (servers.length === 1) {
            this.serverRegistrationStatusBarManagerItem.setRegistrationName(servers[0].name);
            await this.settingsManager.setNonsensitive<ServerRegistrationNonsensitive>(this.customRegistriesKey2, servers[0]);
        }
    }

    public async disconnectServer(node: BaseNode): Promise<void> {
        let servers = await this.getServers();
        const defaultServer = await this.getDefaultServer();
        let registry = servers.find(reg => reg.name.toLowerCase() === node.label.toLowerCase());

        if (registry) {
            let key = this.getUsernamePwdKey(node.label);
            await this.settingsManager.deleteSensitive(key);
            servers.splice(servers.indexOf(registry), 1);
            await this.saveServerRegistrationNonsensitive(servers);

            if (defaultServer && defaultServer.name === registry.name) {
                if (servers.length > 0) {
                    this.serverRegistrationStatusBarManagerItem.setRegistrationName(servers[0].name);
                    await this.settingsManager.setNonsensitive<ServerRegistrationNonsensitive>(this.customRegistriesKey2, servers[0]);
                } else {
                    this.serverRegistrationStatusBarManagerItem.setRegistrationName(undefined);
                }
            }

            await this.refresh();
        }

    }

    public async setDefaultServer(node: ServerNode): Promise<void> {
        const registration: ServerRegistrationNonsensitive = {url: node.registration.url, name: node.registration.name};
        this.serverRegistrationStatusBarManagerItem.setRegistrationName(registration.name);
        await this.settingsManager.setNonsensitive<ServerRegistrationNonsensitive>(this.customRegistriesKey2, registration);
    }

    public async chooseDefaultServer(): Promise<void> {
        const servers = await this.getServers();
        const names: string[] = [];
        servers.forEach(server => {
            names.push(server.name);
        });
        const result = await window.showQuickPick(names, {
            placeHolder: ''
        });
        const registration = servers.find(server => server.name === result);

        if (registration) {
            this.serverRegistrationStatusBarManagerItem.setRegistrationName(registration.name);
        }
        await this.settingsManager.setNonsensitive<ServerRegistrationNonsensitive>(this.customRegistriesKey2, registration);
        await this.notifyServers();
    }

    public async getDefaultServer(): Promise<ServerRegistration | undefined> {
        const nonsensitive = this.settingsManager.getNonsensitive<ServerRegistrationNonsensitive>(this.customRegistriesKey2);
        const servers = this.getServers();

        return Promise.all([nonsensitive, servers])
            .then((a) => {
                let server: ServerRegistration | undefined;
                if (a[0]) {
                    server = a[1].find(registration => registration.url.toLowerCase() === a[0].url.toLowerCase());
                }
                if (!server && a[1].length === 1) {
                    server = a[1][0];
                }
                return Promise.resolve(server);
            })
            .catch(e => Promise.resolve(undefined))
            ;
    }

    private getUsernamePwdKey(registryName: string): string {
        return `usernamepwd_${registryName}`;
    }

    private async refresh(): Promise<void> {
        await commands.executeCommand('vscode-spring-cloud-dataflow.explorer.refresh');
    }

    public async getServers(): Promise<ServerRegistration[]> {
        let servers: ServerRegistration[] = [];
        try {
            const nonsensitive = await this.settingsManager.getNonsensitive<ServerRegistrationNonsensitive[]>(this.customRegistriesKey);
            for (let reg of nonsensitive) {
                let key = this.getUsernamePwdKey(reg.name);
                let credentials = await this.settingsManager.getSensitive<ServerRegistrationCredentials>(key);
                if (credentials) {
                    servers.push({
                        url: reg.url,
                        name: reg.name,
                        credentials
                    });
                }
            }
        } catch (error) {}
        return servers;
    }

    private async saveServerRegistrationNonsensitive(registries: ServerRegistration[]): Promise<void> {
        const minimal: ServerRegistrationNonsensitive[] = registries
            .map(reg => <ServerRegistrationNonsensitive>{
                url: reg.url,
                name: reg.name });
        await this.settingsManager.setNonsensitive(this.customRegistriesKey, minimal);
    }
}
