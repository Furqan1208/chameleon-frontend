import { BaseApi } from "../base.api";

export class URLhausApi extends BaseApi {
  async checkIndicator(indicator: string) {
    const result = await this.request("/threat-intel/urlhaus/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indicator }),
    });
    return result.data;
  }

  async checkUrl(url: string) {
    const result = await this.request("/threat-intel/urlhaus/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indicator: url }),
    });
    return result.data;
  }

  async checkHash(hash: string) {
    const result = await this.request("/threat-intel/urlhaus/hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indicator: hash }),
    });
    return result.data;
  }

  async checkHost(host: string) {
    const result = await this.request("/threat-intel/urlhaus/host", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indicator: host }),
    });
    return result.data;
  }

  async checkTag(tag: string) {
    const result = await this.request("/threat-intel/urlhaus/tag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indicator: tag }),
    });
    return result.data;
  }
}

export const urlhausApi = new URLhausApi();
