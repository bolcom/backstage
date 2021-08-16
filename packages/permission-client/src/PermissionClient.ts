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

import { ResponseError } from '@backstage/errors';
import fetch from 'cross-fetch';
import { PermissionApi, PermissionRequestOptions } from './types/api';

// TODO(mtlewis): Seems from the CatalogClient example that we shouldn't
// be depending on core-plugin-api. Probably worth a wider conversation
// about organization of permission packages and dependencies.
import {
  AuthorizeRequest,
  AuthorizeResponse,
  DiscoveryApi,
} from '@backstage/core-plugin-api';

export class PermissionClient implements PermissionApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
  }

  async authorize(
    request: AuthorizeRequest,
    options?: PermissionRequestOptions,
  ): Promise<AuthorizeResponse> {
    // TODO(mtlewis/orkohunter) validate response as AuthorizeResponse.
    return this.post('/authorize', request, options);
  }

  //
  // Private methods
  //

  private async post(
    path: string,
    request: AuthorizeRequest,
    options?: PermissionRequestOptions,
  ): Promise<any> {
    const response = await fetch(await this.urlFor(path), {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        ...this.authHeaders(options),
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json();
  }

  private authHeaders(
    options?: PermissionRequestOptions,
  ): Record<string, string> {
    return options?.token ? { Authorization: `Bearer ${options.token}` } : {};
  }

  private async urlFor(path: string): Promise<string> {
    return `${await this.discoveryApi.getBaseUrl('permission')}${path}`;
  }
}
