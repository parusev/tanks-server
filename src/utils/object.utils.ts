export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}

export type ValuesOfObject<T extends object> = T[keyof T];
