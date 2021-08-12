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

import { useAsync } from 'react-use';
import {
  authorizationApiRef,
  AuthorizationResult,
  useApi,
} from '@backstage/core-plugin-api';

enum AsyncAuthorizationStatus {
  PENDING = 'PENDING',
}

export type AuthorizationStatus =
  | AsyncAuthorizationStatus
  | AuthorizationResult;

export const useAuthorization = (
  permission: string,
  context: { [key: string]: any },
): AuthorizationStatus => {
  const authorizationApi = useApi(authorizationApiRef);

  const state = useAsync(async () => {
    const { result } = await authorizationApi.authorize({
      permission,
      context,
    });

    return result;
  }, [authorizationApi, permission]);

  return state.loading ? AsyncAuthorizationStatus.PENDING : state.value!;
};
