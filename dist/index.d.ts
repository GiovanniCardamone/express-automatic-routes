import { Application, RequestHandler } from 'express';
export declare const errorLabel = "[ERROR] express-automatic-routes:";
export type ValidMethods = 'CHECKOUT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LOCK' | 'MERGE' | 'MKACTIVITY' | 'MKCOL' | 'MOVE' | 'M-SEARCH' | 'NOTIFY' | 'OPTIONS' | 'PATCH' | 'POST' | 'PURGE' | 'PUT' | 'REPORT' | 'SEARCH' | 'SUBSCRIBE' | 'TRACE' | 'UNLOCK' | 'UNSUBSCRIBE';
type MiddlewareRoute = {
    middleware: RequestHandler | RequestHandler[];
    handler: RequestHandler;
};
export type RouteOptions = RequestHandler | MiddlewareRoute;
export interface Resource {
    middleware?: RequestHandler | RequestHandler[];
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
    mount?: string;
}
export default function (express: Application, options: ExpressAutoroutesOptions): void;
export {};
