export type RouteInfo = {
  path: string;
  params: URLSearchParams;
};

export function currentRoute(): RouteInfo {
  const hash = location.hash.replace(/^#/, "") || "/";
  const [rawPath, queryString] = hash.split("?");
  const cleanPath = (rawPath || "/").replace(/\/+$/, "");

  return {
    path: cleanPath === "" ? "/" : cleanPath,
    params: new URLSearchParams(queryString || ""),
  };
}

export function navigateTo(path: string) {
  window.location.hash = path;
}