import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = 'en'; // Default locale for now
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});