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
	TreeDataProvider, window, ProviderResult, TreeItem, EventEmitter, Event
} from 'vscode';
import { injectable, inject } from 'inversify';
import { IconManager } from '@pivotal-tools/vscode-extension-core';
import { DITYPES} from '@pivotal-tools/vscode-extension-di';
import { BaseNode } from './models/base-node';
import { ServerRegistrationManager } from '../service/server-registration-manager';
import { TYPES } from '../types';
import { ServerMode, ServerNode } from './models/server-node';
import { ServerStatesManager } from '../service/server-states-manager';

@injectable()
export class JobsExplorerProvider implements TreeDataProvider<BaseNode> {

	private _onDidChangeTreeData: EventEmitter<BaseNode> = new EventEmitter<BaseNode>();
	onDidChangeTreeData: Event<BaseNode> = this._onDidChangeTreeData.event;

    constructor(
        @inject(TYPES.ServerRegistrationManager) private serverRegistrationManager: ServerRegistrationManager,
        @inject(TYPES.ServerStatesManager) private serverStatesManager: ServerStatesManager,
		@inject(DITYPES.IconManager) private iconManager: IconManager
    ) {
		const treeView = window.createTreeView('scdfJobs', { treeDataProvider: this });
        this.serverStatesManager.registerRefreshEvents('scdfJobs', treeView, this._onDidChangeTreeData);
	}

	getChildren(element?: BaseNode | undefined): ProviderResult<BaseNode[]> {
		if (!element) {
			return this.getServerNodes();
		}
		return element.getChildren(element);
	}

	getTreeItem(element: BaseNode): TreeItem | Thenable<TreeItem> {
		return element.getTreeItem();
	}

	public refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	private async getServerNodes(): Promise<BaseNode[]> {
		return new Promise(async (resolve, reject) => {
            const servers = await this.serverRegistrationManager.getServers();
			const ret: BaseNode[] = [];
			servers.forEach(registration => {
				ret.push(new ServerNode(
					this.iconManager,
					registration,
					ServerMode.Jobs,
					this.serverStatesManager.getState(registration.url)));
			});
			resolve(ret);
		});
	}
}
