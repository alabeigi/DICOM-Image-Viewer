import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Enable a redirect to match the locale prefix for all paths except
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /favicon.ico, /robots.txt (static files)
    // - All files with extensions (e.g. .png, .jpg, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
