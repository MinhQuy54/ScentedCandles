export type PermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'import'
  | 'export';

export const METHOD_TO_ACTION: Record<string, PermissionAction> = {
  GET: 'view',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};
