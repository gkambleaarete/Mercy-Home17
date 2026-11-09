import { useState } from "react";
import { ZipCodeData } from "../data/mockDashboardData";
import { Search, X, MapPin, TrendingUp, Users, BarChart3 } from "@/app/lib/lucide-icons";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface GeoLocationMapProps {
  data: ZipCodeData[];
}

type ViewMode = "referrals" | "candidates";

export function GeoLocationMap({ data }: GeoLocationMapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("referrals");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredZip, setHoveredZip] = useState<string | null>(null);
  const [selectedZip, setSelectedZip] = useState<ZipCodeData | null>(null);

  // Map projection: Convert lat/long to SVG coordinates
  // Chicago bounds: roughly 41.64-42.02 lat, -87.94 to -87.52 long
  const latMin = 41.64;
  const latMax = 42.02;
  const longMin = -87.94;
  const longMax = -87.52;
  
  const mapWidth = 600;
  const mapHeight = 700;
  
  const projectPoint = (lat: number, long: number) => {
    const x = ((long - longMin) / (longMax - longMin)) * mapWidth;
    const y = mapHeight - ((lat - latMin) / (latMax - latMin)) * mapHeight;
    return { x, y };
  };

  // Filter data based on search
  const filteredData = data.filter(
    (zip) =>
      zip.zipCode.includes(searchTerm) ||
      zip.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get max value for scaling
  const maxValue = Math.max(
    ...filteredData.map((d) =>
      viewMode === "referrals" ? d.referrals : d.candidates
    )
  );

  // Calculate dot size based on value
  const getDotSize = (value: number) => {
    const minSize = 8;
    const maxSize = 32;
    return minSize + (value / maxValue) * (maxSize - minSize);
  };

  // Get color based on value intensity
  const getDotColor = (value: number) => {
    const intensity = value / maxValue;
    if (viewMode === "referrals") {
      // Mercy Green gradient
      const baseColor = { r: 20, g: 95, b: 51 }; // #145F33
      const lightness = 1 - intensity * 0.5;
      return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.5 + intensity * 0.5})`;
    } else {
      // SLDS Blue gradient
      const baseColor = { r: 1, g: 118, b: 211 }; // #0176D3
      const lightness = 1 - intensity * 0.5;
      return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.5 + intensity * 0.5})`;
    }
  };

  const currentValue = (zip: ZipCodeData) =>
    viewMode === "referrals" ? zip.referrals : zip.candidates;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("referrals")}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor:
                viewMode === "referrals" ? "#145F33" : "transparent",
              color: viewMode === "referrals" ? "white" : "#145F33",
              border: `2px solid #145F33`,
            }}
          >
            Referrals
          </button>
          <button
            onClick={() => setViewMode("candidates")}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor:
                viewMode === "candidates" ? "#0176D3" : "transparent",
              color: viewMode === "candidates" ? "white" : "#0176D3",
              border: `2px solid #0176D3`,
            }}
          >
            Candidates
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          />
          <Input
            type="text"
            placeholder="Search zip code or neighborhood..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
            style={{
              border: "1px solid var(--slds-g-color-border-base-4)",
              borderRadius: "var(--slds-c-input-radius-border)",
            }}
          />
        </div>
      </div>

      {/* Map Container */}
      <div
        className="rounded-lg p-8 overflow-hidden"
        style={{
          backgroundColor: "#F3F3F3",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="relative" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-auto"
            style={{ maxHeight: "700px" }}
          >
            {/* Chicago City Outline (Simplified) */}
            <rect
              x="0"
              y="0"
              width={mapWidth}
              height={mapHeight}
              fill="#E5E7EB"
              opacity="0.3"
            />
            
            {/* Lake Michigan (right side) */}
            <path
              d={`M ${mapWidth * 0.75} 0 L ${mapWidth} 0 L ${mapWidth} ${mapHeight} L ${mapWidth * 0.75} ${mapHeight} Q ${mapWidth * 0.8} ${mapHeight * 0.7} ${mapWidth * 0.75} ${mapHeight * 0.5} Q ${mapWidth * 0.7} ${mapHeight * 0.3} ${mapWidth * 0.75} 0`}
              fill="#B3D9FF"
              opacity="0.4"
            />

            {/* Grid lines for reference */}
            {[...Array(10)].map((_, i) => (
              <g key={`grid-${i}`}>
                <line
                  x1="0"
                  y1={(i * mapHeight) / 10}
                  x2={mapWidth}
                  y2={(i * mapHeight) / 10}
                  stroke="#D1D5DB"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
                <line
                  x1={(i * mapWidth) / 10}
                  y1="0"
                  x2={(i * mapWidth) / 10}
                  y2={mapHeight}
                  stroke="#D1D5DB"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </g>
            ))}

            {/* Data Points */}
            {filteredData.map((zip) => {
              const point = projectPoint(zip.latitude, zip.longitude);
              const value = currentValue(zip);
              const size = getDotSize(value);
              const color = getDotColor(value);
              const isHovered = hoveredZip === zip.zipCode;

              return (
                <g key={zip.zipCode}>
                  {/* Outer glow when hovered */}
                  {isHovered && (
                    <circle
                      key={`glow-${zip.zipCode}`}
                      cx={point.x}
                      cy={point.y}
                      r={size + 8}
                      fill={color}
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Main dot */}
                  <circle
                    key={`dot-${zip.zipCode}`}
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? size + 3 : size}
                    fill={color}
                    stroke="white"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredZip(zip.zipCode)}
                    onMouseLeave={() => setHoveredZip(null)}
                    onClick={() => setSelectedZip(zip)}
                    style={{
                      filter: isHovered
                        ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                        : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                    }}
                  />

                  {/* Label on hover */}
                  {isHovered && (
                    <g key={`label-${zip.zipCode}`}>
                      {/* Tooltip background */}
                      <rect
                        x={point.x + size + 10}
                        y={point.y - 35}
                        width="140"
                        height="60"
                        rx="4"
                        fill="white"
                        stroke="#D1D5DB"
                        strokeWidth="1"
                        style={{
                          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
                        }}
                      />
                      {/* Tooltip content */}
                      <text
                        x={point.x + size + 20}
                        y={point.y - 15}
                        className="text-xs font-semibold"
                        fill="#2E2E2E"
                      >
                        {zip.zipCode}
                      </text>
                      <text
                        x={point.x + size + 20}
                        y={point.y}
                        className="text-xs"
                        fill="#5C5C5C"
                      >
                        {zip.neighborhood}
                      </text>
                      <text
                        x={point.x + size + 20}
                        y={point.y + 15}
                        className="text-xs font-semibold"
                        fill={viewMode === "referrals" ? "#145F33" : "#0176D3"}
                      >
                        {value} {viewMode}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div
            className="absolute bottom-4 left-4 rounded-lg p-4"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid var(--slds-g-color-border-base-1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h4
              className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {viewMode === "referrals" ? "Referrals" : "Candidates"} Volume
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div
                  className="rounded-full"
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor:
                      viewMode === "referrals"
                        ? "rgba(20, 95, 51, 0.6)"
                        : "rgba(1, 118, 211, 0.6)",
                  }}
                />
                <span className="text-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Low
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="rounded-full"
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor:
                      viewMode === "referrals"
                        ? "rgba(20, 95, 51, 0.8)"
                        : "rgba(1, 118, 211, 0.8)",
                  }}
                />
                <span className="text-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Medium
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="rounded-full"
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor:
                      viewMode === "referrals"
                        ? "rgba(20, 95, 51, 1)"
                        : "rgba(1, 118, 211, 1)",
                  }}
                />
                <span className="text-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  High
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Zip Code Modal */}
      {selectedZip && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setSelectedZip(null)}
        >
          <div
            className="rounded-lg max-w-2xl w-full mx-4"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--slds-g-color-border-base-1)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-4 flex items-start justify-between"
              style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: viewMode === "referrals" ? "rgba(20, 95, 51, 0.1)" : "rgba(1, 118, 211, 0.1)",
                  }}
                >
                  <MapPin
                    className="h-6 w-6"
                    style={{ color: viewMode === "referrals" ? "#145F33" : "#0176D3" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{
                      fontSize: "1.25rem",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {selectedZip.neighborhood}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--slds-g-color-text-weak)" }}
                  >
                    Zip Code: {selectedZip.zipCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedZip(null)}
                className="p-2 rounded-full transition-colors hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" style={{ color: "var(--slds-g-color-text-weak)" }} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Primary Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "rgba(20, 95, 51, 0.05)",
                    border: "1px solid rgba(20, 95, 51, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5" style={{ color: "#145F33" }} />
                    <p
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#145F33" }}
                    >
                      Referrals
                    </p>
                  </div>
                  <p
                    className="font-bold"
                    style={{ fontSize: "2rem", color: "#145F33", lineHeight: "1" }}
                  >
                    {selectedZip.referrals}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--slds-g-color-text-weak)" }}
                  >
                    {((selectedZip.referrals / filteredData.reduce((sum, z) => sum + z.referrals, 0)) * 100).toFixed(1)}% of total
                  </p>
                </div>

                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "rgba(1, 118, 211, 0.05)",
                    border: "1px solid rgba(1, 118, 211, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" style={{ color: "#0176D3" }} />
                    <p
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#0176D3" }}
                    >
                      Candidates
                    </p>
                  </div>
                  <p
                    className="font-bold"
                    style={{ fontSize: "2rem", color: "#0176D3", lineHeight: "1" }}
                  >
                    {selectedZip.candidates}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--slds-g-color-text-weak)" }}
                  >
                    {((selectedZip.candidates / filteredData.reduce((sum, z) => sum + z.candidates, 0)) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>

              {/* Conversion Rate */}
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "#F3F3F3",
                  border: "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" style={{ color: "var(--slds-g-color-text-default)" }} />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--slds-g-color-text-default)" }}
                    >
                      Referral to Candidate Conversion Rate
                    </p>
                  </div>
                  <Badge
                    className="text-xs rounded-sm"
                    style={{
                      backgroundColor: selectedZip.referrals > 0 && (selectedZip.candidates / selectedZip.referrals) >= 0.5
                        ? "#D1FAE5"
                        : "#FEF3C7",
                      borderColor: selectedZip.referrals > 0 && (selectedZip.candidates / selectedZip.referrals) >= 0.5
                        ? "#10B981"
                        : "#F59E0B",
                      color: selectedZip.referrals > 0 && (selectedZip.candidates / selectedZip.referrals) >= 0.5
                        ? "#065F46"
                        : "#92400E",
                    }}
                  >
                    {selectedZip.referrals > 0
                      ? `${((selectedZip.candidates / selectedZip.referrals) * 100).toFixed(1)}%`
                      : "N/A"}
                  </Badge>
                </div>
                
                {/* Progress Bar */}
                {selectedZip.referrals > 0 && (
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-1 h-3 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#E5E7EB" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((selectedZip.candidates / selectedZip.referrals) * 100, 100)}%`,
                          backgroundColor: (selectedZip.candidates / selectedZip.referrals) >= 0.5 ? "#10B981" : "#F59E0B",
                        }}
                      />
                    </div>
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: "var(--slds-g-color-text-default)", minWidth: "48px" }}
                    >
                      {((selectedZip.candidates / selectedZip.referrals) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Location Details */}
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "#F3F3F3",
                  border: "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <h4
                  className="text-sm font-semibold mb-3"
                  style={{ color: "var(--slds-g-color-text-default)" }}
                >
                  Location Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p
                      className="text-xs uppercase tracking-wide mb-1"
                      style={{ color: "var(--slds-g-color-text-weak)" }}
                    >
                      Latitude
                    </p>
                    <p style={{ color: "var(--slds-g-color-text-default)" }}>
                      {selectedZip.latitude.toFixed(4)}°
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs uppercase tracking-wide mb-1"
                      style={{ color: "var(--slds-g-color-text-weak)" }}
                    >
                      Longitude
                    </p>
                    <p style={{ color: "var(--slds-g-color-text-default)" }}>
                      {selectedZip.longitude.toFixed(4)}°
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="px-6 py-4 flex items-center justify-end gap-3"
              style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
            >
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setSelectedZip(null)}
                style={{
                  borderColor: "var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Close
              </Button>
              <Button
                className="rounded-full"
                style={{
                  backgroundColor: "#145F33",
                  color: "#FFFFFF",
                }}
              >
                View Detailed Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}