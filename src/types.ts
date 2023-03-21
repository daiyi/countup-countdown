export const ROOT_ID_KEY = "rootDocId";

export interface State {
  countUpDate: Date | null;
  countDownDate: Date | null;
  title?: string;
  displaySettings: Display;
}
export type Params = {
  s?: Date | null;
  e?: Date | null;
  t?: string;
  d?: Display;
};

export type Boolstring = "t" | "f";

export type DisplayParams = {
  c?: Boolstring; // calendar
};
export type Display = {
  calendar?: boolean;
};

export const urlDateFormat = "YYYY-MM-DD"; // doesn't require plugin
