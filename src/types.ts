export const ROOT_ID_KEY = "rootDocId";

export interface State {
  countUpDate: Date | null;
  countDownDate: Date | null;
}

export type Params = {
  s?: Date | null;
  e?: Date | null;
  t?: string;
};

export const urlDateFormat = "YYYY-MM-DD"; // doesn't require plugin
