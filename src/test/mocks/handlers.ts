// test/mocks/handlers.ts
// MSW handlers para mockar API durante testes

import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8000';

export const handlers = [
    // Auth endpoints
    http.post(`${API_BASE_URL}/api/auth/login`, () => {
        return HttpResponse.json({
            access_token: 'mock-token-123',
            token_type: 'bearer',
            user: {
                id: 'user-123',
                email: 'test@example.com',
                role: 'owner',
                first_name: 'Test',
                last_name: 'User',
            },
        });
    }),

    http.get(`${API_BASE_URL}/api/auth/me`, () => {
        return HttpResponse.json({
            id: 'user-123',
            email: 'test@example.com',
            role: 'owner',
            first_name: 'Test',
            last_name: 'User',
            created_at: '2024-01-01T00:00:00Z',
            subscription: {
                plan: 'free',
                status: 'active',
                max_organizations: 1,
                max_users_per_org: 5,
                features: [],
            },
        });
    }),

    // Organizations endpoints
    http.get(`${API_BASE_URL}/api/memberships/my-organizations`, () => {
        return HttpResponse.json({
            total: 1,
            organizations: [
                {
                    organization: {
                        id: 'org-123',
                        name: 'Test Organization',
                        description: 'Test description',
                        created_at: '2024-01-01T00:00:00Z',
                    },
                    membership: {
                        id: 'membership-123',
                        role: 'owner',
                        created_at: '2024-01-01T00:00:00Z',
                    },
                },
            ],
        });
    }),

    // Transactions endpoints
    http.get(`${API_BASE_URL}/api/v1/transactions`, () => {
        return HttpResponse.json([
            {
                id: 1,
                organization_id: 'org-123',
                type: 'expense',
                description: 'Test expense',
                category: 'Alimentação',
                value: 50.0,
                payment_method: 'PIX',
                date: '2024-01-15',
                tags: [
                    {
                        id: 'tag-123',
                        name: 'Alimentação',
                        tag_type: {
                            id: 'tagtype-123',
                            name: 'categoria',
                            description: 'Categoria da transação',
                            is_required: true,
                            max_per_transaction: 1,
                        },
                        color: '#FF5733',
                        is_default: true,
                        is_active: true,
                        organization_id: 'org-123',
                    },
                ],
            },
        ]);
    }),

    http.post(`${API_BASE_URL}/api/v1/transactions`, () => {
        return HttpResponse.json({
            id: 2,
            organization_id: 'org-123',
            type: 'income',
            description: 'Test income',
            category: 'Salário',
            value: 1000.0,
            payment_method: 'Transferência',
            date: '2024-01-01',
            tags: [],
        }, { status: 201 });
    }),

    // Tags endpoints
    http.get(`${API_BASE_URL}/api/v1/tag-types`, () => {
        return HttpResponse.json({
            tag_types: [
                {
                    id: 'tagtype-123',
                    name: 'categoria',
                    description: 'Categoria da transação',
                    is_required: true,
                    max_per_transaction: 1,
                },
            ],
        });
    }),

    http.get(`${API_BASE_URL}/api/v1/tags`, () => {
        return HttpResponse.json({
            tags: [
                {
                    id: 'tag-123',
                    name: 'Alimentação',
                    tag_type: {
                        id: 'tagtype-123',
                        name: 'categoria',
                    },
                    color: '#FF5733',
                    is_default: true,
                    is_active: true,
                    organization_id: 'org-123',
                },
            ],
        });
    }),
];
