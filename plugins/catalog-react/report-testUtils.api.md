## API Report File for "@backstage/plugin-catalog-react"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { ApiFactory } from '@backstage/frontend-plugin-api';
import { ApiMock } from '@backstage/frontend-test-utils';
import { CatalogApi } from '@backstage/catalog-client';
import { DefaultEntityFilters } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { EntityListContextProps } from '@backstage/plugin-catalog-react';
import { PropsWithChildren } from 'react';
import { default as React_2 } from 'react';

// @public
export function catalogApiMock(options?: { entities?: Entity[] }): CatalogApi;

// @public
export namespace catalogApiMock {
  const factory: (options?: {
    entities?: Entity[];
  }) => ApiFactory<CatalogApi, CatalogApi, {}>;
  const mock: (
    partialImpl?: Partial<CatalogApi> | undefined,
  ) => ApiMock<CatalogApi>;
}

// @public
export function MockEntityListContextProvider<
  T extends DefaultEntityFilters = DefaultEntityFilters,
>(
  props: PropsWithChildren<{
    value?: Partial<EntityListContextProps<T>>;
  }>,
): React_2.JSX.Element;
```
