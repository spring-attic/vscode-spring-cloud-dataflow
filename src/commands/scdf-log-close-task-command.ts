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
import { OutputManager }  from '@pivotal-tools/vscode-extension-core';
import { Command, DITYPES } from '@pivotal-tools/vscode-extension-di';
import { OUTPUT_TAG_TASK, COMMAND_SCDF_LOG_CLOSE_TASK } from '../extension-globals';

/**
 * Command which is disposing all outputs tagged with 'task'.
 */
@injectable()
export class ScdfLogCloseTaskCommand implements Command {

    constructor(
        @inject(DITYPES.OutputManager) private outputManager: OutputManager
    ) {}

    get id() {
        return COMMAND_SCDF_LOG_CLOSE_TASK;
    }

    async execute() {
        this.outputManager.disposeTagged([OUTPUT_TAG_TASK]);
    }
}
