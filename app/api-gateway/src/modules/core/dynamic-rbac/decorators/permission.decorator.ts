import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '../types/permission-action.type';

export const PERMISSION_KEY = 'dynamic_rbac_permission';

export interface PermissionMetadata {
  pathCode: string;
  action?: PermissionAction;
}

/**
 * @Permission('PATH_CODE')           — action tự suy từ HTTP method
 * @Permission('PATH_CODE', 'create') — override action cụ thể
 */
export const Permission = (pathCode: string, action?: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { pathCode, action } as PermissionMetadata);
