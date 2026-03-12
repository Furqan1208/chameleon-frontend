import { BaseApi } from "../base.api";
import { OTXResult } from "@/lib/types/alienvault.types";

export class AlienVaultApi extends BaseApi {
  async scan(request: {
    indicator: string;
    type: string; // Frontend may send IPv4, IPv6, file, cve, etc.
    include_all_sections?: boolean;
  }): Promise<OTXResult> {
    // Map frontend indicator types to backend types (ip, domain, url, hash)
    let backendType: "ip" | "domain" | "url" | "hash";
    
    const frontendType = request.type.toLowerCase();
    
    if (frontendType === 'ipv4' || frontendType === 'ipv6' || frontendType === 'ip') {
      backendType = 'ip';
    } else if (frontendType === 'file' || frontendType === 'hash') {
      backendType = 'hash';
    } else if (frontendType === 'domain' || frontendType === 'hostname') {
      backendType = 'domain';
    } else if (frontendType === 'url') {
      backendType = 'url';
    } else {
      // Default to domain for other types (cve, email, mutex, etc.)
      // These will use the domain endpoint which is most generic
      backendType = 'domain';
    }
    
    console.log(`[AlienVaultApi] Mapping type: ${request.type} -> ${backendType}`);
    
    const result = await this.request("/threat-intel/alienvault/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        indicator: request.indicator,
        type: backendType
      }),
    });
    
    // Transform flat backend response into frontend OTXResult structure with sections
    const data = result.data;
    return this.transformBackendResponse(data);
  }

  private transformBackendResponse(data: any): OTXResult {
    console.log('[AlienVaultApi] Transforming backend response:', data);
    
    // Calculate threat score based on pulse count
    const threat_score = data.pulse_count > 0 ? Math.min(100, data.pulse_count * 10) : 0;
    
    // Build sections object matching frontend expectations
    const result: OTXResult = {
      ioc: data.ioc,
      ioc_type: data.ioc_type,
      found: data.found,
      pulse_count: data.pulse_count || 0,
      threat_level: data.threat_level || 'unknown',
      threat_score,
      malware_count: data.malware_families?.length || 0,
      url_count: data.url_list?.length || 0,
      passive_dns_count: data.passive_dns?.length || 0,
      otx_url: `https://otx.alienvault.com/indicators/${data.ioc_type}/${data.ioc}`,
      timestamp: data.timestamp,
      sections: {
        general: {
          indicator: data.ioc,
          type: data.ioc_type,
          asn: data.asn,
          country_name: data.country,
          isp: data.isp,
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          region: data.region,
          organization: data.organization,
          whois: data.whois,
          reputation: data.reputation,
          pulse_info: {
            count: data.pulse_count || 0,
            pulses: [], // Backend doesn't send pulse details in flat response
            references: data.references || []
          }
        }
      },
      tags: data.tags || [],
      adversaries: data.adversaries || [],
      raw_data: data
    };
    
    // Add malware section if data exists
    if (data.malware_families?.length > 0) {
      result.sections.malware = {
        data: data.malware_families.map((family: string) => ({
          family: family,
          count: 1
        }))
      };
    }
    
    // Add URL list section if data exists
    if (data.url_list?.length > 0) {
      result.sections.url_list = {
        url_list: data.url_list.map((url: any) => ({
          url: typeof url === 'string' ? url : url.url || url,
          date: data.timestamp
        }))
      };
    }
    
    // Add passive DNS section if data exists
    if (data.passive_dns?.length > 0) {
      result.sections.passive_dns = {
        passive_dns: data.passive_dns.map((record: any) => ({
          record_type: 'DNS',
          record: typeof record === 'string' ? record : record.record || record,
          last_seen: data.timestamp,
          first_seen: data.timestamp
        }))
      };
    }
    
    console.log('[AlienVaultApi] Transformed result:', result);
    return result;
  }
}

export const alienVaultApi = new AlienVaultApi();
