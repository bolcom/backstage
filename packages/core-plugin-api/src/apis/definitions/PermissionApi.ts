/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ApiRef, createApiRef } from '../system';

export enum AuthorizeResult {
  DENY = 'DENY',
  ALLOW = 'ALLOW',
}

export type AuthorizeOptions = {
  // TODO(mtlewis/orkohunter): Should `permission`'s type be a string or a literal type composed of available permission strings?
  permission: string;
  // TODO(mtlewis/orkohunter): can we sprinkle some generics somewhere in here
  // to allow stronger typing of context?
  context: {
    [key: string]: any;
  };
};

export type AuthorizeResponse = {
  result: AuthorizeResult;
};

export type PermissionApi = {
  authorize(options: AuthorizeOptions): Promise<AuthorizeResponse>;
};

export const permissionApiRef: ApiRef<PermissionApi> = createApiRef({
  id: 'core.permission',
});
