// api/tags.ts
import apiClient from './client';
import { TagsResponse, Tag } from '../types/api';

/**
 * Lista todas as tags de uma organização, opcionalmente filtradas por tipo de tag
 */
export const listTags = async (
  organizationId: string,
  tagType?: string
): Promise<TagsResponse> => {
  const response = await apiClient.get<TagsResponse>('/api/v1/tags', {
    params: {
      organization_id: organizationId,
      tag_type: tagType, // Opcional: nome do tipo de tag (ex: "categoria")
    },
  });
  return response.data;
};

