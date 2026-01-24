import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedResponse<T = unknown> {
  data: T;
  meta: unknown;
}

interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: unknown;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor<
  unknown,
  ApiResponse<unknown>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((data) => {
        if (
          typeof data === 'object' &&
          data !== null &&
          'data' in data &&
          'meta' in data
        ) {
          const paginated = data as PaginatedResponse<unknown>;

          return {
            success: true,
            data: paginated.data,
            meta: paginated.meta,
          };
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}
