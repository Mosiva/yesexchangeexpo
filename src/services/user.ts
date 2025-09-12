import { AxiosRequestConfig } from 'axios';

import { restApi } from '../api';
import { CreateUserData, ListResponse, UpdateUserData, User } from '@/types';

const userApi = restApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, AxiosRequestConfig<User>>({
      query: (config) => ({ url: '/auth/profile', ...config }),
    }),
    updateUser: builder.mutation<User, UpdateUserData>({
      query: (user) => ({ url: '/user/' + user.id, method: 'PUT', data: user }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export default userApi;
