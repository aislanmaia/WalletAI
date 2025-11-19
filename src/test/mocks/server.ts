// test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server com handlers para testes
export const server = setupServer(...handlers);
