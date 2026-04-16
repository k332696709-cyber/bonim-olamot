import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // השפות שאתה תומך בהן
  locales: ['he', 'en'],
  // שפת ברירת המחדל
  defaultLocale: 'he'
});
 
export const config = {
  // השורה הזו אומרת למידלוור לעבוד על כל הדפים באתר
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};