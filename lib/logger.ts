/* Minimal logger shim. Harvested files import `@/lib/logger`. */
type Meta = unknown;
export const logger = {
  info: (msg: string, meta?: Meta) => console.info(msg, meta ?? ''),
  warn: (msg: string, meta?: Meta) => console.warn(msg, meta ?? ''),
  error: (msg: string, err?: Meta, meta?: Meta) => console.error(msg, err ?? '', meta ?? ''),
};
