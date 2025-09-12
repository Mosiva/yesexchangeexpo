import type { AxiosRequestConfig } from 'axios';

import { restApi } from '../api';
import {Language, ListResponse, StandardResponse,} from '@/types';

export const languageApi = restApi.injectEndpoints({
  endpoints: (builder) => ({
    getLanguages: builder.query<ListResponse<Language>, AxiosRequestConfig<Language>>({
      query: (config) => ({ url: '/languages', ...config, }),
      providesTags: ['Languages'],
    }),

    getLanguage: builder.query<Language, { id: Language['id']; config?: AxiosRequestConfig<Language> }>(
      {
        query: ({ id, config }) => ({ url: `/languages/${id}`, ...config }),
        transformResponse: (response: StandardResponse<Language>) => response.data,
        providesTags: ['Languages'],
      },
    ),
  }),
});
