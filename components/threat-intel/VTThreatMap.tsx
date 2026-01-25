// components/threat-intel/VTThreatMap.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Globe,
  AlertTriangle,
  Network,
  Target,
  ZoomIn,
  ZoomOut,
  X,
  Map,
  Shield,
  ExternalLink,
  ChevronRight,
  Hash,
  FileText,
  List as ListIcon,
  RotateCcw,
  MapPin,
  MousePointer2,
  Hand,
  Search
} from 'lucide-react';
import type { VTScanHistory } from '@/lib/threat-intel/vt-types';

interface ThreatMapProps {
  history: VTScanHistory[];
  className?: string;
}

interface ThreatDataPoint {
  countryCode: string;
  countryName: string;
  count: number;
  threats: number;
  malicious: number;
  suspicious: number;
  ips: Array<{
    ip: string;
    threat_level: string;
    threat_score: number;
    timestamp: string;
    type: string;
  }>;
}

// Simple world map SVG - using a cleaner, more detailed SVG
const WorldMapSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 400"
    className="w-full h-full"
    preserveAspectRatio="xMidYMid meet"
  >
    {/* Background */}
    <rect width="800" height="400" fill="#0f172a" />
    
    {/* Continents - Simplified outlines */}
    <g fill="none" stroke="rgba(30, 41, 59, 0.8)" strokeWidth="0.5">
      {/* North America */}
      <path d="M100,100 L150,80 L200,100 L220,150 L180,180 L130,150 Z" />
      {/* South America */}
      <path d="M200,200 L240,220 L260,300 L220,320 L180,280 L190,220 Z" />
      {/* Europe */}
      <path d="M350,100 L400,90 L420,120 L410,150 L380,140 L360,120 Z" />
      {/* Africa */}
      <path d="M360,150 L420,140 L440,200 L430,250 L380,240 L350,200 Z" />
      {/* Asia */}
      <path d="M450,80 L550,90 L580,150 L560,200 L520,180 L480,120 Z" />
      {/* Australia */}
      <path d="M580,250 L620,260 L640,300 L600,320 L580,280 Z" />
    </g>
    
    {/* Grid lines */}
    <g stroke="rgba(51, 65, 85, 0.3)" strokeWidth="0.3" strokeDasharray="2,2">
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`h-${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />
      ))}
      {Array.from({ length: 17 }).map((_, i) => (
        <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" />
      ))}
    </g>
  </svg>
);

// Country coordinates for the simplified map
const COUNTRY_COORDINATES = {
  'US': { x: 150, y: 120, name: 'United States', region: 'North America' },
  'GB': { x: 360, y: 110, name: 'United Kingdom', region: 'Europe' },
  'DE': { x: 380, y: 115, name: 'Germany', region: 'Europe' },
  'FR': { x: 370, y: 125, name: 'France', region: 'Europe' },
  'CN': { x: 520, y: 140, name: 'China', region: 'Asia' },
  'RU': { x: 450, y: 90, name: 'Russia', region: 'Europe/Asia' },
  'JP': { x: 580, y: 140, name: 'Japan', region: 'Asia' },
  'IN': { x: 480, y: 170, name: 'India', region: 'Asia' },
  'BR': { x: 230, y: 240, name: 'Brazil', region: 'South America' },
  'AU': { x: 600, y: 280, name: 'Australia', region: 'Oceania' },
  'CA': { x: 130, y: 90, name: 'Canada', region: 'North America' },
  'MX': { x: 140, y: 160, name: 'Mexico', region: 'North America' },
  'KR': { x: 560, y: 140, name: 'South Korea', region: 'Asia' },
  'IT': { x: 380, y: 130, name: 'Italy', region: 'Europe' },
  'ES': { x: 350, y: 140, name: 'Spain', region: 'Europe' },
  'NL': { x: 370, y: 110, name: 'Netherlands', region: 'Europe' },
  'SE': { x: 390, y: 95, name: 'Sweden', region: 'Europe' },
  'PL': { x: 400, y: 115, name: 'Poland', region: 'Europe' },
  'TR': { x: 420, y: 140, name: 'Turkey', region: 'Asia' },
  'SA': { x: 440, y: 170, name: 'Saudi Arabia', region: 'Middle East' },
  'ZA': { x: 400, y: 280, name: 'South Africa', region: 'Africa' },
  'EG': { x: 410, y: 160, name: 'Egypt', region: 'Africa' },
  'NG': { x: 380, y: 210, name: 'Nigeria', region: 'Africa' },
  'AR': { x: 220, y: 300, name: 'Argentina', region: 'South America' },
  'ID': { x: 540, y: 220, name: 'Indonesia', region: 'Asia' },
  'SG': { x: 520, y: 200, name: 'Singapore', region: 'Asia' },
  'MY': { x: 510, y: 190, name: 'Malaysia', region: 'Asia' },
  'TH': { x: 500, y: 170, name: 'Thailand', region: 'Asia' },
  'VN': { x: 520, y: 160, name: 'Vietnam', region: 'Asia' },
};

export function VTThreatMap({ history, className = '' }: ThreatMapProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedIP, setSelectedIP] = useState<string | null>(null);
  const [threatData, setThreatData] = useState<ThreatDataPoint[]>([]);
  const [filter, setFilter] = useState<'all' | 'malicious' | 'suspicious'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Process threat data from history
  useEffect(() => {
    if (history.length === 0) {
      setThreatData([]);
      return;
    }

    const countryStats: Record<string, ThreatDataPoint> = {};

    history.forEach(scan => {
      const countryCode = scan.result.network_info?.country || 'Unknown';
      if (countryCode === 'Unknown' || !COUNTRY_COORDINATES[countryCode as keyof typeof COUNTRY_COORDINATES]) return;

      const countryKey = countryCode as keyof typeof COUNTRY_COORDINATES;
      
      if (!countryStats[countryCode]) {
        const countryInfo = COUNTRY_COORDINATES[countryKey];
        
        countryStats[countryCode] = {
          countryCode,
          countryName: countryInfo.name,
          count: 0,
          threats: 0,
          malicious: 0,
          suspicious: 0,
          ips: []
        };
      }

      const stats = countryStats[countryCode];
      stats.count++;
      
      stats.ips.push({
        ip: scan.indicator,
        threat_level: scan.result.threat_level,
        threat_score: scan.result.threat_score || 0,
        timestamp: scan.timestamp,
        type: scan.type
      });

      if (scan.result.threat_level === 'high') {
        stats.threats++;
        stats.malicious++;
      } else if (scan.result.threat_level === 'medium') {
        stats.threats++;
        stats.suspicious++;
      }
    });

    const data = Object.values(countryStats)
      .sort((a, b) => b.threats - a.threats);

    setThreatData(data);
  }, [history]);

  // Handle map dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!mapContainerRef.current) return;
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    
    // Calculate mouse position relative to map
    const rect = mapContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Adjust position to zoom towards mouse
    const zoomFactor = newZoom / zoom;
    setPosition(prev => ({
      x: mouseX - (mouseX - prev.x) * zoomFactor,
      y: mouseY - (mouseY - prev.y) * zoomFactor
    }));
    
    setZoom(newZoom);
  };

  // Get filtered data
  const filteredData = threatData.filter(point => {
    if (filter === 'malicious') return point.malicious > 0;
    if (filter === 'suspicious') return point.suspicious > 0;
    return true;
  });

  // Calculate marker size
  const getMarkerSize = (threats: number) => {
    const maxSize = 40;
    const minSize = 12;
    const maxThreats = Math.max(...threatData.map(d => d.threats), 1);
    return minSize + (threats / maxThreats) * (maxSize - minSize);
  };

  // Get marker color
  const getMarkerColor = (malicious: number, suspicious: number) => {
    if (malicious > 0) return '#ef4444';
    if (suspicious > 0) return '#f97316';
    return '#3b82f6';
  };

  // Reset map
  const resetMap = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));

  // Calculate stats
  const overallStats = {
    totalCountries: threatData.length,
    totalThreats: threatData.reduce((sum, point) => sum + point.threats, 0),
    totalMalicious: threatData.reduce((sum, point) => sum + point.malicious, 0),
    totalSuspicious: threatData.reduce((sum, point) => sum + point.suspicious, 0),
    totalScans: threatData.reduce((sum, point) => sum + point.count, 0),
  };

  if (history.length === 0) {
    return (
      <div className={`glass border border-border rounded-xl p-6 text-center ${className}`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
          <Globe className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Global Threat Map</h3>
        <p className="text-muted-foreground">No scan data available</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start scanning IPs to visualize global threat distribution
        </p>
      </div>
    );
  }

  return (
    <div className={`glass border border-border rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Global Threat Map</h3>
            <p className="text-sm text-muted-foreground">
              Visualizing {overallStats.totalScans} scans across {overallStats.totalCountries} countries
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{overallStats.totalCountries}</div>
              <div className="text-xs text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-destructive">{overallStats.totalThreats}</div>
              <div className="text-xs text-muted-foreground">Threats</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{overallStats.totalScans}</div>
              <div className="text-xs text-muted-foreground">Scans</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode */}
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'map'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              <Map className="w-3 h-3" />
              Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              <ListIcon className="w-3 h-3" />
              List
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('malicious')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'malicious'
                  ? 'bg-destructive text-white'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Malicious
            </button>
            <button
              onClick={() => setFilter('suspicious')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'suspicious'
                  ? 'bg-accent text-white'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              <Shield className="w-3 h-3" />
              Suspicious
            </button>
          </div>
          
          {/* Zoom Controls */}
          {viewMode === 'map' && (
            <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
              <button
                onClick={handleZoomOut}
                className="px-3 py-1.5 hover:bg-muted/20 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-xs text-muted-foreground min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="px-3 py-1.5 hover:bg-muted/20 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {viewMode === 'map' && (
            <>
              <button
                onClick={resetMap}
                className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors text-xs flex items-center gap-2"
                title="Reset map"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MousePointer2 className="w-3 h-3" />
                <span>Click: Select</span>
                <Hand className="w-3 h-3 ml-2" />
                <span>Drag: Pan</span>
                <Search className="w-3 h-3 ml-2" />
                <span>Scroll: Zoom</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map/List View */}
        <div className={`lg:col-span-2 ${viewMode === 'map' ? '' : 'hidden lg:block'}`}>
          {viewMode === 'map' ? (
            <div 
              ref={mapContainerRef}
              className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-950/30 to-gray-900/30 border border-border h-[400px]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {/* Map Container */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                  transition: isDragging ? 'none' : 'transform 0.2s ease'
                }}
              >
                {/* World Map */}
                <WorldMapSVG />
                
                {/* Threat Markers */}
                {filteredData.map((point) => {
                  const countryInfo = COUNTRY_COORDINATES[point.countryCode as keyof typeof COUNTRY_COORDINATES];
                  if (!countryInfo) return null;

                  const size = getMarkerSize(point.threats);
                  const color = getMarkerColor(point.malicious, point.suspicious);
                  const isSelected = selectedCountry === point.countryCode;
                  const isHovered = hoveredCountry === point.countryCode;

                  return (
                    <div
                      key={point.countryCode}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                      style={{
                        left: `${countryInfo.x}px`,
                        top: `${countryInfo.y}px`,
                        zIndex: isSelected ? 50 : point.threats
                      }}
                      onMouseEnter={() => setHoveredCountry(point.countryCode)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => {
                        setSelectedCountry(point.countryCode === selectedCountry ? null : point.countryCode);
                        setSelectedIP(null);
                      }}
                    >
                      {/* Pulsing effect */}
                      {point.threats > 0 && (
                        <div
                          className="absolute inset-0 rounded-full animate-ping opacity-20"
                          style={{ 
                            backgroundColor: color,
                            width: `${size}px`,
                            height: `${size}px`,
                            marginLeft: `-${size/2}px`,
                            marginTop: `-${size/2}px`
                          }}
                        />
                      )}
                      
                      {/* Main marker */}
                      <div
                        className={`relative rounded-full border-2 border-white/80 shadow-xl transition-all duration-200 ${
                          isSelected ? 'scale-125 ring-4 ring-white/30' : 
                          isHovered ? 'scale-110' : ''
                        }`}
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          backgroundColor: color
                        }}
                      >
                        {/* Country code */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold opacity-90">
                            {point.countryCode}
                          </span>
                        </div>
                        
                        {/* Threat count */}
                        {point.threats > 0 && (
                          <div 
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border-2 border-current flex items-center justify-center shadow-lg"
                            style={{ borderColor: color }}
                          >
                            <span className="text-xs font-bold" style={{ color }}>
                              {point.threats}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tooltip */}
                      {(isSelected || isHovered) && (
                        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
                          <div className="px-3 py-2 bg-black/90 backdrop-blur-sm text-white text-sm rounded-lg shadow-2xl min-w-[160px]">
                            <div className="font-semibold mb-1">{point.countryName}</div>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div className="text-muted-foreground">Scans:</div>
                              <div className="font-medium">{point.count}</div>
                              <div className="text-muted-foreground">Threats:</div>
                              <div className={`font-medium ${point.malicious > 0 ? 'text-destructive' : 'text-accent'}`}>
                                {point.threats}
                              </div>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-black/90 rotate-45"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Zoom level indicator */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg">
                Zoom: {Math.round(zoom * 100)}%
              </div>
              
              {/* Instructions */}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Hand className="w-3 h-3" />
                  <span>Drag to pan • Scroll to zoom • Click for details</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {threatData.map((point, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedCountry(point.countryCode)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        point.malicious > 0 ? 'bg-destructive' :
                        point.suspicious > 0 ? 'bg-accent' : 'bg-primary'
                      }`} />
                      <div>
                        <h4 className="font-semibold text-foreground">{point.countryName}</h4>
                        <p className="text-xs text-muted-foreground">{point.count} scans • {point.ips.length} IPs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        point.malicious > 0 ? 'bg-destructive/20 text-destructive' :
                        point.suspicious > 0 ? 'bg-accent/20 text-accent' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {point.threats} threats
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {point.malicious} malicious
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {point.suspicious} suspicious
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side Panel - Keep your existing side panel code */}
        <div className="space-y-4">
          {selectedCountry && threatData.find(p => p.countryCode === selectedCountry) ? (
            <CountryDetails 
              data={threatData.find(p => p.countryCode === selectedCountry)!}
              onClose={() => setSelectedCountry(null)}
              onIPClick={setSelectedIP}
              selectedIP={selectedIP}
            />
          ) : (
            <div className="border border-border rounded-lg p-6 text-center">
              <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Select a country to view details</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click on any country marker above
              </p>
            </div>
          )}

          {selectedIP && history.find(h => h.indicator === selectedIP) && (
            <IPDetails 
              data={history.find(h => h.indicator === selectedIP)!}
              onClose={() => setSelectedIP(null)}
            />
          )}

          <Legend />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function CountryDetails({ 
  data, 
  onClose, 
  onIPClick, 
  selectedIP 
}: { 
  data: ThreatDataPoint; 
  onClose: () => void; 
  onIPClick: (ip: string) => void;
  selectedIP: string | null;
}) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4" />
          {data.countryName}
        </h4>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="Total Scans" value={data.count} color="blue" />
          <StatBox label="Total Threats" value={data.threats} color="red" />
          <StatBox label="Malicious" value={data.malicious} color="destructive" />
          <StatBox label="Suspicious" value={data.suspicious} color="accent" />
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-foreground mb-2">IP Addresses ({data.ips.length})</h5>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {data.ips.map((ip, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border cursor-pointer transition-colors ${
                  selectedIP === ip.ip 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:bg-muted/10'
                }`}
                onClick={() => onIPClick(ip.ip)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ip.type === 'hash' ? <Hash className="w-3 h-3" /> : 
                     ip.type === 'ip' ? <Network className="w-3 h-3" /> : 
                     <FileText className="w-3 h-3" />}
                    <code className="text-xs font-mono">{ip.ip}</code>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    ip.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                    ip.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {ip.threat_level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>Score: {ip.threat_score}</span>
                  <span>{new Date(ip.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IPDetails({ data, onClose }: { data: VTScanHistory; onClose: () => void }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Network className="w-4 h-4" />
          IP Details
        </h4>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">IP Address</p>
          <code className="text-sm font-mono text-foreground bg-muted/30 p-2 rounded block">
            {data.indicator}
          </code>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm font-medium">{data.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Threat Level</p>
            <p className={`text-sm font-medium capitalize ${
              data.result.threat_level === 'high' ? 'text-destructive' :
              data.result.threat_level === 'medium' ? 'text-accent' :
              'text-primary'
            }`}>
              {data.result.threat_level}
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground">Detection Ratio</p>
          <p className="text-sm font-medium">{data.result.detection_stats.detection_ratio}</p>
        </div>
        
        <button
          onClick={() => window.open(data.result.vt_url, '_blank')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          View on VirusTotal
        </button>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="border border-border rounded-lg p-4">
      <h4 className="font-semibold text-foreground mb-3">Map Legend</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-destructive"></div>
          <div>
            <p className="text-sm font-medium">Malicious</p>
            <p className="text-xs text-muted-foreground">High threat detections</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-accent"></div>
          <div>
            <p className="text-sm font-medium">Suspicious</p>
            <p className="text-xs text-muted-foreground">Medium threat level</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary"></div>
          <div>
            <p className="text-sm font-medium">Clean</p>
            <p className="text-xs text-muted-foreground">No threats detected</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    red: 'text-destructive border-destructive/20 bg-destructive/5',
    destructive: 'text-destructive border-destructive/20 bg-destructive/5',
    accent: 'text-accent border-accent/20 bg-accent/5',
    primary: 'text-primary border-primary/20 bg-primary/5'
  };

  return (
    <div className={`border rounded p-2 text-center ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}