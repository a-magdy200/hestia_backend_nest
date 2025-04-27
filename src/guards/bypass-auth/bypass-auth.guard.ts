import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ENDPOINT_KEY } from 'src/config/constants';

export const BypassAuth = () => SetMetadata(PUBLIC_ENDPOINT_KEY, true);
