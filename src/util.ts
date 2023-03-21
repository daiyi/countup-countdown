import dayjs from "dayjs";
import { Display, DisplayParams, Params, urlDateFormat } from "./types";

export function createParams(maybeUrl?: string): Params | undefined {
  const url = new URL(maybeUrl ? maybeUrl : document.location.toString());
  const params: Params = {};
  const startDate = url.searchParams.get("s");
  const endDate = url.searchParams.get("e");
  const title = url.searchParams.get("t");
  const rawDisplay = url.searchParams.get("d");

  if (startDate) {
    params.s = dayjs(startDate, urlDateFormat).toDate();
  }
  if (endDate) {
    params.e = dayjs(endDate, urlDateFormat).toDate();
  }
  if (title && title.length > 0) {
    params.t = title;
  }
  if (rawDisplay && rawDisplay.length > 0) {
    const display = parseDisplayParams(rawDisplay);
    if (display) {
      params.d = display;
    }
  }
  return Object.values(params).length > 0 ? params : undefined;
}

function parseDisplayParams(s: string): Display | null {
  if (!s) return null;
  const params = JSON.parse(s);
  const display: Display = {};
  if (params.c) {
    display.calendar = params.c === "t" ? true : false;
  }
  return display;
}

function toDisplayParams(display: Display): DisplayParams | null {
  if (Object.values(display).length === 0) {
    return null;
  }

  const displayParams: DisplayParams = {};
  if (Object.keys(display).includes("calendar")) {
    displayParams.c = display.calendar === true ? "t" : "f";
  }

  return displayParams;
}

export function getShareUrl(params: Params): string {
  const urlParams = new URLSearchParams();
  if (params.s) {
    urlParams.set("s", dayjs(params.s).format(urlDateFormat));
  }
  if (params.e) {
    urlParams.set("e", dayjs(params.e).format(urlDateFormat));
  }
  if (params.t) {
    urlParams.set("t", params.t);
  }
  if (params.d) {
    const displayParams = toDisplayParams(params.d);
    if (displayParams) {
      urlParams.set("d", JSON.stringify(displayParams));
    }
  }
  return (
    window.location.origin +
    window.location.pathname +
    "?" +
    urlParams.toString()
  );
}
