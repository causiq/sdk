import { KeyValue } from '../keyvalue';

function render(value: any) {
  if (value == null) return value;

  switch (typeof value) {
    case 'object': {
      return JSON.stringify(value);
    }

    default:
      return String(value);
  }
}

export type Templated = { message: string; consumed: KeyValue[]; remaining: KeyValue[] };

export default function template(template: string, args: Record<string, any> = {}): Templated {
  const consumed: KeyValue[] = [],
    argsCopy = { ...args };
  const message = template.replace(/\{([\w-]+)\}/g, substr => {
    const v = substr.replace(/[}{]/g, '');
    let value;
    if ((value = render(args[v])) != null) {
      consumed.push({ key: v, value });
      delete argsCopy[v];
      return value;
    } else return v;
  });
  const remaining = Object.keys(argsCopy).map(key => ({ key, value: argsCopy[key] }));
  return { message, consumed, remaining };
}
