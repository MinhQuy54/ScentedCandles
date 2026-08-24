import { PartialType } from '@nestjs/mapped-types';
import { CreateDynamicRbacDto } from './create-dynamic-rbac.dto';

export class UpdateDynamicRbacDto extends PartialType(CreateDynamicRbacDto) {}
