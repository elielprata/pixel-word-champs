
import React from 'react';
import { UserListContainer } from './users/UserListContainer';
import { logger } from '@/utils/logger';

export const AllUsersList = () => {
  logger.debug('Renderizando lista completa de usuários', undefined, 'ALL_USERS_LIST');
  
  return <UserListContainer />;
};
