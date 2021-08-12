/*
 * Copyright 2020 The Backstage Authors
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

import { errorHandler, SingleHostDiscovery } from '@backstage/backend-common';
import express, { Response } from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { AuthorizeResponse, AuthorizeResult } from '@backstage/core-plugin-api';
import { IdentityClient } from '@backstage/plugin-auth-backend';
import { Config } from '@backstage/config';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;
  const discovery = SingleHostDiscovery.fromConfig(config);
  const identity = new IdentityClient({
    discovery,
    issuer: await discovery.getExternalBaseUrl('auth'),
  });

  const router = Router();
  router.use(express.json());

  router.post('/authorize', async (req, res: Response<AuthorizeResponse>) => {
    const token = IdentityClient.getBearerToken(req.header('authorization'));

    // TODO(mtlewis/orkohunter): Should be possible to register
    // a permission handler elsewhere and run it here to determine
    // the result.

    if (token) {
      const { id } = await identity.authenticate(token);
      logger.info(`authorizing as user: ${id}...`);

      res.json({
        // TODO: why does this enum work? It's a frontend package. Should move to a common package.
        result: AuthorizeResult.ALLOW,
      });
    } else {
      logger.info('authorizing anonymously...');

      res.json({
        result: AuthorizeResult.DENY,
      });
    }
  });

  router.use(errorHandler());
  return router;
}
