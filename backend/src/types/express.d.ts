import "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id?: string;
        userType?: string;
        email?: string;
      };
    }
  }
}

// This export is needed to make this a module
export {};
