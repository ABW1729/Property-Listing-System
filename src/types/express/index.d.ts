

import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      // You can add more properties here, like `role`, `email`, etc.
    };
  }
}

