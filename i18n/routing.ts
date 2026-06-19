import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'vi', 'ko', 'zh-Hans', 'ru'],
  defaultLocale: 'en',
  // English unprefixed (stays at /); zh-Hans shown publicly as /zh.
  localePrefix: { mode: 'as-needed', prefixes: { 'zh-Hans': '/zh' } },
  // / always means English — no cookie/Accept-Language redirect of unprefixed routes.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
