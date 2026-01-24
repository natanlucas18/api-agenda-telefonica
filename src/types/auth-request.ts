import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { JwtPayload } from './jwt-payload';

export interface AuthRequest extends Request {
  user?: User;
  tokenPayload?: JwtPayload;
}
