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

import {
  PermissionApi,
  AuthorizeOptions,
  AuthorizeResponse,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

export class DefaultPermissionApi implements PermissionApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly identityApi: IdentityApi,
  ) {}

  async authorize(options: AuthorizeOptions): Promise<AuthorizeResponse> {
    const permissionBackendUrl = await this.discoveryApi.getBaseUrl(
      'permission',
    );

    const token = await this.identityApi.getIdToken();
    const response = await fetch(`${permissionBackendUrl}/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(options),
    });

    // TODO(mtlewis/orkohunter) validate response as AuthorizeResponse.
    return response.json();
  }
}
