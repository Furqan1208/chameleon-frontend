import { BaseApi } from "../base.api";

export class AbuseIPDBApi extends BaseApi {
  async checkIp(ip: string, maxAgeDays = 90) {
    const result = await this.request(
      `/threat-intel/abuseipdb/check/${encodeURIComponent(ip)}?max_age_days=${maxAgeDays}`,
    );
    return result.data;
  }
}

export const abuseIPDBApi = new AbuseIPDBApi();
