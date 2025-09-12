import { AxiosRequestConfig } from 'axios';

import { restApi } from '../api';
import { City, ListResponse } from '@/types';

export const countryApi = restApi.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query<Pick<ListResponse<City>, 'data'>, AxiosRequestConfig<City>>({
      query: (config) => ({ url: '/countries?per_page=all', ...config }),
      providesTags: ['Countries'],
    }),
  }),
});

