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
import { AbstractStatusBarManagerItem } from '@pivotal-tools/vscode-extension-core';
import { injectable } from 'inversify';
import { COMMAND_SCDF_SERVER_CHOOSE } from '../extension-globals';

@injectable()
export class ServerRegistrationStatusBarManagerItem extends AbstractStatusBarManagerItem {

    private static readonly prefix: string = '$(database) ';

    public setRegistrationName(name: string | undefined): void {
        this.setText(ServerRegistrationStatusBarManagerItem.prefix + (name || '[Connect SCDF]'));
    }

    public getCommand(): string {
        return COMMAND_SCDF_SERVER_CHOOSE;
    }
}
