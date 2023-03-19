import dayjs from "dayjs";
import { Params, urlDateFormat } from "./types";

export function createParams(maybeUrl?: string): Params | undefined {
  const url = new URL(maybeUrl ? maybeUrl : document.location.toString());
  const params: Params = {};
  const startDate = url.searchParams.get("s");
  const endDate = url.searchParams.get("e");
  const title = url.searchParams.get("t");

  if (startDate) {
    params.s = dayjs(startDate, urlDateFormat).toDate();
  }
  if (endDate) {
    params.e = dayjs(endDate, urlDateFormat).toDate();
  }
  if (title && title.length > 0) {
    params.t = decodeURIComponent(title);
  }

  return Object.values(params).length > 0 ? params : undefined;
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
    urlParams.set("t", encodeURIComponent(params.t));
  }
  return (
    window.location.origin +
    window.location.pathname +
    "?" +
    urlParams.toString()
  );
}
