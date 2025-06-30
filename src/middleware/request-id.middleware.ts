import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { IRequest } from '@/interfaces/express.interface';

/**
 * Request ID middleware
 * Generates and attaches unique request identifiers for request tracing and logging
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  /**
   * Process incoming request to add request ID
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  use(req: IRequest, res: Response, next: NextFunction): void {
    // Generate request ID if not present
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    // Attach to request object
    req['requestId'] = requestId;

    // Attach to response headers
    res.setHeader('x-request-id', requestId);

    // Add to response locals for logging
    res.locals['requestId'] = requestId;

    next();
  }
}
