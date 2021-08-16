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

import { RestContext, rest, ResponseComposition } from 'msw';
import { setupServer } from 'msw/node';
import { PermissionClient } from './PermissionClient';
import {
  AuthorizeResponse,
  AuthorizeResult,
  DiscoveryApi,
} from '@backstage/core-plugin-api';

const server = setupServer();
const token = 'fake-token';
const mockBaseUrl = 'http://backstage:9191/i-am-a-mock-base';
const discoveryApi: DiscoveryApi = {
  async getBaseUrl(_pluginId) {
    return mockBaseUrl;
  },
};

describe('PermissionClient', () => {
  let client: PermissionClient;

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  beforeEach(() => {
    client = new PermissionClient({ discoveryApi });
  });

  describe('authorize', () => {
    const mockAuthorizeHandler = jest.fn(
      (
        _req,
        res: ResponseComposition<AuthorizeResponse>,
        { json }: RestContext,
      ) => {
        const responseBody: AuthorizeResponse = {
          result: AuthorizeResult.ALLOW,
        };

        return res(json(responseBody));
      },
    );

    beforeEach(() => {
      server.use(rest.post(`${mockBaseUrl}/authorize`, mockAuthorizeHandler));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch entities from correct endpoint', async () => {
      await client.authorize({
        permission: 'test.permission',
        context: { foo: 'bar' },
      });

      expect(mockAuthorizeHandler).toHaveBeenCalled();
    });

    it('should include a request body', async () => {
      await client.authorize({
        permission: 'test.permission',
        context: { foo: 'bar' },
      });

      const request = mockAuthorizeHandler.mock.calls[0][0];

      expect(request.body).toEqual({
        permission: 'test.permission',
        context: { foo: 'bar' },
      });
    });

    it('should return the response from the fetch request', async () => {
      const response = await client.authorize({
        permission: 'test.permission',
        context: { foo: 'bar' },
      });

      expect(response).toEqual({ result: AuthorizeResult.ALLOW });
    });

    it('should not include authorization headers if no token is supplied', async () => {
      await client.authorize({
        permission: 'test.permission',
        context: { foo: 'bar' },
      });

      const request = mockAuthorizeHandler.mock.calls[0][0];

      expect(request.headers.has('authorization')).toEqual(false);
    });

    it('should include correctly-constructed authorization header if token is supplied', async () => {
      await client.authorize(
        {
          permission: 'test.permission',
          context: { foo: 'bar' },
        },
        { token },
      );

      const request = mockAuthorizeHandler.mock.calls[0][0];

      expect(request.headers.get('authorization')).toEqual('Bearer fake-token');
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        mockAuthorizeHandler.mockImplementationOnce(
          (
            _req,
            res: ResponseComposition<AuthorizeResponse>,
            { status }: RestContext,
          ) => {
            return res(status(401));
          },
        );
      });

      it('should include correctly-constructed authorization header if token is supplied', async () => {
        await expect(
          client.authorize(
            {
              permission: 'test.permission',
              context: { foo: 'bar' },
            },
            { token },
          ),
        ).rejects.toThrowError(/request failed with 401/i);
      });
    });
  });
});
