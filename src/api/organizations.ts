// api/organizations.ts
import apiClient from './client';
import { MyOrganizationsResponse } from '../types/api';

/**
 * Lista todas as organizações onde o usuário tem membership
 */
export const getMyOrganizations = async (): Promise<MyOrganizationsResponse> => {
  const response = await apiClient.get<MyOrganizationsResponse>(
    '/api/memberships/my-organizations'
  );
  return response.data;
};

