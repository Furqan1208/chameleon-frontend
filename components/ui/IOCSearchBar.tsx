// components/ui/IOCSearchBar.tsx
'use client';

import { useState } from 'react';
import { Search, Hash, Globe, Link, FileText, Cpu, Loader } from 'lucide-react';
import type { VTIndicatorType } from '@/lib/threat-intel/vt-types';

interface IOCSearchBarProps {
  onSearch: (indicator: string, type: VTIndicatorType) => void;
  scanning?: boolean;
  placeholder?: string;
}

export function IOCSearchBar({ onSearch, scanning, placeholder = "Enter hash, IP, domain, or URL..." }: IOCSearchBarProps) {
  const [input, setInput] = useState('');
  const [autoDetectedType, setAutoDetectedType] = useState<VTIndicatorType | null>(null);

  const detectType = (value: string): VTIndicatorType => {
    const trimmed = value.trim();
    
    // Hash detection
    if (/^[a-fA-F0-9]{32}$/.test(trimmed)) return 'hash'; // MD5
    if (/^[a-fA-F0-9]{40}$/.test(trimmed)) return 'hash'; // SHA1
    if (/^[a-fA-F0-9]{64}$/.test(trimmed)) return 'hash'; // SHA256
    
    // IP detection
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipRegex.test(trimmed)) return 'ip';
    
    // URL detection
    try {
      const url = new URL(trimmed);
      if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'ftp:') {
        return 'url';
      }
    } catch {}
    
    // Domain detection
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (domainRegex.test(trimmed)) return 'domain';
    
    // Default to filename search
    if (trimmed.includes('.') && trimmed.length > 3) return 'filename';
    
    return 'hash'; // Default
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.trim()) {
      setAutoDetectedType(detectType(value));
    } else {
      setAutoDetectedType(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || scanning) return;
    
    const type = detectType(input);
    onSearch(input.trim(), type);
    setInput('');
    setAutoDetectedType(null);
  };

  const getTypeIcon = (type: VTIndicatorType) => {
    switch (type) {
      case 'hash': return <Hash className="w-4 h-4" />;
      case 'ip': return <Globe className="w-4 h-4" />;
      case 'domain': return <Globe className="w-4 h-4" />;
      case 'url': return <Link className="w-4 h-4" />;
      case 'filename': return <FileText className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: VTIndicatorType) => {
    switch (type) {
      case 'hash': return 'Hash';
      case 'ip': return 'IP Address';
      case 'domain': return 'Domain';
      case 'url': return 'URL';
      case 'filename': return 'Filename';
      default: return 'Unknown';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <div className="absolute left-3 text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={scanning}
          className="w-full pl-10 pr-32 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {autoDetectedType && (
          <div className="absolute right-16 flex items-center gap-2 px-2 py-1 text-xs rounded bg-primary/10 text-primary">
            {getTypeIcon(autoDetectedType)}
            <span>{getTypeLabel(autoDetectedType)}</span>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!input.trim() || scanning}
          className="absolute right-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {scanning ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Scan</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Supported formats:</span>
        <span className="px-2 py-0.5 bg-muted rounded">MD5/SHA1/SHA256</span>
        <span className="px-2 py-0.5 bg-muted rounded">IPv4 Address</span>
        <span className="px-2 py-0.5 bg-muted rounded">Domain Name</span>
        <span className="px-2 py-0.5 bg-muted rounded">URL</span>
        <span className="px-2 py-0.5 bg-muted rounded">Filename</span>
      </div>
    </form>
  );
}