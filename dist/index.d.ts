import { Application, Request, Response, NextFunction } from 'express';
export declare const errorLabel = "[ERROR] express-automatic-routes:";
export declare type ValidMethods = 'CHECKOUT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LOCK' | 'MERGE' | 'MKACTIVITY' | 'MKCOL' | 'MOVE' | 'M-SEARCH' | 'NOTIFY' | 'OPTIONS' | 'PATCH' | 'POST' | 'PURGE' | 'PUT' | 'REPORT' | 'SEARCH' | 'SUBSCRIBE' | 'TRACE' | 'UNLOCK' | 'UNSUBSCRIBE';
interface Middleware {
    <T>(req: Request & T, res: Response, next: NextFunction): void;
}
declare type Route = (request: Request, response: Response) => any;
declare type MiddlewareRoute = {
    middleware: Middleware | Middleware[];
    handler: Route;
};
export declare type RouteOptions = Route | MiddlewareRoute;
export interface Resource {
    middleware?: Middleware | Middleware[];
    delete?: RouteOptions;
    get?: RouteOptions;
    head?: RouteOptions;
    patch?: RouteOptions;
    post?: RouteOptions;
    put?: RouteOptions;
    options?: RouteOptions;
}
interface ExpressAutoroutesOptions {
    dir: string;
    log?: boolean;
}
export default function (express: Application, options: ExpressAutoroutesOptions): void;
export {};
