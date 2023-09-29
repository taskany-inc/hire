import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { languages } from './utils/getLang';

export function middleware(request: NextRequest) {
    const acceptLanguage = request.headers.get('Accept-Language');

    if (
        !acceptLanguage ||
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/favicon')
    ) {
        return NextResponse.next();
    }
    const { locale } = request.nextUrl;
    const localeFromHeader = acceptLanguage.slice(0, 2);

    if (locale === localeFromHeader) return NextResponse.next();

    if (languages.some((language) => localeFromHeader === language)) {
        return NextResponse.redirect(`${request.nextUrl.origin}/${localeFromHeader}${request.nextUrl.pathname}`);
    }
    return NextResponse.next();
}
