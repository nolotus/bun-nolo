import { nolotusDomain } from "core/init";
import { isDevelopment } from "utils/env";

export const getDomains = () => {
  const currentDomain = isDevelopment
    ? "localhost"
    : window.location.port
      ? `${window.location.hostname}:${window.location.port}`
      : `${window.location.hostname}`;
  let domains = nolotusDomain.map((domain) => ({ domain, source: domain }));

  if (!domains.some((item) => item.domain === currentDomain)) {
    domains.push({ domain: currentDomain, source: currentDomain });
  }
  return domains;
};
