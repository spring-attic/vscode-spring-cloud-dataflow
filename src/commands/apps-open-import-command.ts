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
import { workspace, window, QuickPickItem } from 'vscode';
import { injectable, inject } from 'inversify';
import axios from 'axios';
import { ReadOnlyDocumentManager } from '@pivotal-tools/vscode-extension-core';
import { Command, DITYPES } from '@pivotal-tools/vscode-extension-di';
import { COMMAND_SCDF_APPS_OPEN_IMPORT, CONFIG_SCDF_APPS_IMPORTS } from '../extension-globals';

@injectable()
export class AppsOpenImportCommand implements Command {

    constructor(
        @inject(DITYPES.ReadOnlyDocumentManager) private readOnlyDocumentManager: ReadOnlyDocumentManager
    ) {}

    get id() {
        return COMMAND_SCDF_APPS_OPEN_IMPORT;
    }

    async execute() {
        const pick = await window.showQuickPick(this.getQuickPickItems(), {});
        if (pick && pick.detail) {
            const content = await this.getImportContent(pick.detail);
            await this.readOnlyDocumentManager.openReadOnlyContent({label: pick.detail, fullId: pick.detail}, content, '.scdfa');
        }
    }

    private getQuickPickItems(): Thenable<QuickPickItem[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const imports: AppImportConfig[] | undefined = workspace.getConfiguration().get(CONFIG_SCDF_APPS_IMPORTS);
                if (imports) {
                    const items: QuickPickItem[] = [];
                    imports.forEach(i => {
                        items.push({
                            label: i.desc || i.uri,
                            detail: i.uri
                        });
                    });
                    resolve(items);
                }
                resolve([]);
            }
            catch (error) {
                resolve([]);
            }
        });
    }

    private getImportContent(uri: string): Thenable<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(uri, {
                });
                resolve(response.data);
            }
            catch (error) {
                resolve();
            }
        });
    }
}

interface AppImportConfig {
    uri: string;
    desc?: string;
}
