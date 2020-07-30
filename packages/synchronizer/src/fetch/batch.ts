import { envStr } from '@muta-extra/common';
import Axios from 'axios';
import Bluebird from 'bluebird';
import { chunk, reduce } from 'lodash';

const axios = Axios.create({
  baseURL: envStr('MUTA_ENDPOINT', 'http://127.0.0.1:8000/graphql'),
});

export type Batched<T> = {
  [key: string]: T;
};

export async function batchWithSameFragment<T>(
  queries: string,
  fragment: string,
): Promise<Batched<T>> {
  const batched = await axios.post<{ data: Batched<T> }>('', {
    query: `
      {
        ${queries}
      }
      ${fragment}
    `,
  });

  return batched.data.data;
}

interface ChunkAndBatchOption<Result, Source> {
  taskSource: Source[];
  generateQuerySegment: (x: Source, i: number) => string;
  chunkSize: number;
  concurrency: number;
  fragment: string;
}

export async function chunkAndBatch<Result, Source = string>(
  options: ChunkAndBatchOption<Result, Source>,
) {
  const {
    taskSource,
    fragment,
    generateQuerySegment,
    chunkSize,
    concurrency,
  } = options;

  const queries = taskSource.map(generateQuerySegment);
  const chunkedQueries = chunk(queries, chunkSize).map((chunkedQueryString) =>
    chunkedQueryString.join('\n'),
  );

  const chunkedAndBatched = await Bluebird.all(chunkedQueries).map(
    (queries) => batchWithSameFragment<Result>(queries, fragment),
    { concurrency },
  );

  return reduce<Batched<Result>[], Batched<Result>>(
    chunkedAndBatched,
    (batched, item) => {
      return Object.assign(batched, item);
    },
    {} as Batched<Result>,
  );
}
