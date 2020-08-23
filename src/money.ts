export type Money = Readonly<{
  currency: string;
  amount: number;
}>

export function isMoney(x: any): x is Money {
  return x != null
    && typeof x === 'object'
    && typeof x.currency === 'string'
    && typeof x.amount === 'number'
}

export default function money(moneyOrCurrency: Money | 'EUR' | 'USD' | string, amount?: number): Money {
  if (isMoney(moneyOrCurrency)) return moneyOrCurrency
  if (typeof moneyOrCurrency === 'string' && amount != null) return { currency: moneyOrCurrency, amount }
  return { currency: 'EUR', amount: 0 }
}