import { AxiosRequestConfig } from 'axios';

import { restApi } from '../api';
import { City, ListResponse } from '@/types';

export const cityApi = restApi.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query<Pick<ListResponse<City>, 'data'>, AxiosRequestConfig<City>>({
      query: (config) => ({ url: '/cities?per_page=all', ...config }),
      //transformResponse: (cities: City[]) => ({ data: cities }),
      providesTags: ['Cities'],
    }),

    createCity: builder.mutation<City, City>({
      query: (city) => ({ url: '/city', method: 'POST', data: city }),
      invalidatesTags: ['Cities'],
    }),

    updateCity: builder.mutation<City, City>({
      query: (city) => ({ url: '/city/' + city.id, method: 'PUT', data: city }),
      invalidatesTags: ['Cities'],
    }),

    deleteCity: builder.mutation<unknown, City>({
      query: (city) => ({ url: '/city/' + city.id, method: 'DELETE' }),
      invalidatesTags: ['Cities'],
    }),
  }),
});

