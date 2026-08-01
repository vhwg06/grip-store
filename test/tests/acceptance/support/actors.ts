export const actors = {
  catalogOperator: "Catalog Operator",
  customer: "customer",
} as const;

export type Actor = (typeof actors)[keyof typeof actors];
