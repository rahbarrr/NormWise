import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Filter,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ArrowRight,
  Info,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getStandardGraph } from "../services/standardApi";

const GRAPH_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "NORMATIVE_REFERENCE", label: "Normative" },
  { id: "TEST_METHOD", label: "Test" },
  { id: "SAFETY", label: "Safety" },
  { id: "COMPONENT", label: "Component" },
  { id: "INSTALLATION", label: "Installation" },
  { id: "EQUIVALENT", label: "Equivalent" },
  { id: "MATERIAL", label: "Material" },
];

const EDGE_COLORS = {
  NORMATIVE_REFERENCE: "#3b82f6", // blue-500
  TEST_METHOD: "#10b981", // emerald-500
  SAFETY: "#f59e0b", // amber-500
  COMPONENT: "#64748b", // slate-500
  INSTALLATION: "#8b5cf6", // purple-500
  EQUIVALENT: "#06b6d4", // cyan-500
  MATERIAL: "#0d9488", // teal-600
  SUPERSEDED_BY: "#ef4444", // red-500
  OTHER: "#94a3b8", // slate-400
};

export const KnowledgeGraph = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const standardQuery = searchParams.get("standard") || "IS 2347:2023";
  const depthParam = parseInt(searchParams.get("depth") || "1", 10);

  const [depth, setDepth] = useState(Math.min(3, Math.max(1, depthParam)));
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Load Knowledge Graph from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchGraph() {
      setIsLoading(true);
      try {
        const data = await getStandardGraph(standardQuery, depth, {
          type: selectedFilter !== "ALL" ? selectedFilter : null,
        });
        if (isMounted) {
          setGraphData(data);
          // Set initial root as default selection if none selected
          const root = data.nodes?.find((n) => n.isRoot);
          if (root && !selectedNode) {
            setSelectedNode(root);
          }
        }
      } catch (err) {
        console.error("Knowledge graph fetch failed:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchGraph();
    return () => {
      isMounted = false;
    };
  }, [standardQuery, depth, selectedFilter]);

  // Compute Layout coordinates for nodes
  const layout = useMemo(() => {
    const nodes = graphData.nodes || [];
    const edges = graphData.edges || [];

    if (nodes.length === 0) return { positionedNodes: [], positionedEdges: [] };

    const centerX = 450;
    const centerY = 320;
    const positionedNodes = [];

    // Root node at center
    const rootNode = nodes.find((n) => n.isRoot) || nodes[0];
    const nonRootNodes = nodes.filter((n) => n.id !== rootNode?.id);

    if (rootNode) {
      positionedNodes.push({
        ...rootNode,
        x: centerX,
        y: centerY,
      });
    }

    // Group non-root nodes by level or distribute radially
    const level1Nodes = nonRootNodes.filter((n) => n.level === 1 || n.level === undefined);
    const level2Nodes = nonRootNodes.filter((n) => n.level === 2);
    const level3Nodes = nonRootNodes.filter((n) => n.level === 3);

    // Place Level 1 in inner circle (radius 180)
    const r1 = 185;
    level1Nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / (level1Nodes.length || 1) - Math.PI / 2;
      positionedNodes.push({
        ...node,
        x: centerX + r1 * Math.cos(angle),
        y: centerY + r1 * Math.sin(angle),
      });
    });

    // Place Level 2 in middle circle (radius 290)
    const r2 = 295;
    level2Nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / (level2Nodes.length || 1) - Math.PI / 3;
      positionedNodes.push({
        ...node,
        x: centerX + r2 * Math.cos(angle),
        y: centerY + r2 * Math.sin(angle),
      });
    });

    // Place Level 3 in outer circle (radius 380)
    const r3 = 390;
    level3Nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / (level3Nodes.length || 1);
      positionedNodes.push({
        ...node,
        x: centerX + r3 * Math.cos(angle),
        y: centerY + r3 * Math.sin(angle),
      });
    });

    // Node lookup map
    const nodePosMap = new Map(positionedNodes.map((n) => [n.id, n]));

    // Build positioned edges
    const positionedEdges = edges
      .map((edge) => {
        const source = nodePosMap.get(edge.source);
        const target = nodePosMap.get(edge.target);
        if (!source || !target) return null;

        // Calculate midpoint for label
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        return {
          ...edge,
          sourcePos: source,
          targetPos: target,
          midX,
          midY,
        };
      })
      .filter(Boolean);

    return { positionedNodes, positionedEdges };
  }, [graphData]);

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest(".node-element")) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDepthChange = (newDepth) => {
    setDepth(newDepth);
    setSearchParams({ standard: standardQuery, depth: newDepth.toString() });
  };

  const handleRootChange = (stdNum) => {
    setSearchParams({ standard: stdNum, depth: depth.toString() });
    setSelectedNode(null);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-700" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Indian Standards Knowledge Graph
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              PostgreSQL Relational Traversal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surfaces connected normative references, component standards, materials, and safety regulations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/standards/${encodeURIComponent(standardQuery)}`)}
            className="text-xs h-8 text-slate-700"
          >
            <span>View Standard Profile</span>
            <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-xs h-8"
          >
            <span>Back</span>
          </Button>
        </div>
      </div>

      {/* Control Bar: Filters, Depth Selector & Zoom Tools */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardContent className="p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Relationship Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>

            {GRAPH_FILTERS.map((f) => {
              const isActive = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Depth Selector & Canvas Viewport Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Depth Selector (Capped strictly at 3) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Depth:</span>
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDepthChange(d)}
                  className={`w-6 h-6 rounded text-xs font-mono font-bold transition-colors ${
                    depth === d
                      ? "bg-white text-blue-700 shadow-2xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title={`Traverse up to depth ${d}`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Zoom & Fit Tools */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                className="p-1 rounded text-slate-600 hover:bg-white hover:shadow-2xs"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-[10px] px-1 text-slate-600">
                {Math.round(zoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                className="p-1 rounded text-slate-600 hover:bg-white hover:shadow-2xs"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={resetView}
                className="p-1 rounded text-slate-600 hover:bg-white hover:shadow-2xs ml-0.5"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interactive Canvas Area + Slide-in Details Drawer */}
      <div className="relative rounded-2xl border border-slate-200/90 bg-slate-50/50 overflow-hidden shadow-xs h-[580px]">
        {/* Subtle Canvas Grid Background */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing relative select-none"
        >
          {/* SVG Canvas with Zoom and Pan Transform */}
          <svg
            className="w-full h-full"
            viewBox="0 0 900 640"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="grid-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.6" />
              </pattern>

              {/* Arrowhead marker */}
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="28"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
              </marker>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid-dots)" />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* 1. EDGES */}
              {layout.positionedEdges.map((edge) => {
                const isSelected =
                  selectedNode &&
                  (edge.source === selectedNode.id || edge.target === selectedNode.id);
                const strokeColor = EDGE_COLORS[edge.relationshipType] || "#94a3b8";

                return (
                  <g key={edge.id} className="transition-all duration-200">
                    <line
                      x1={edge.sourcePos.x}
                      y1={edge.sourcePos.y}
                      x2={edge.targetPos.x}
                      y2={edge.targetPos.y}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      strokeDasharray={edge.relationshipType === "SUPERSEDED_BY" ? "4 4" : "none"}
                      opacity={isSelected ? 1 : 0.75}
                      markerEnd="url(#arrow)"
                    />

                    {/* Edge Label Pill */}
                    <g transform={`translate(${edge.midX}, ${edge.midY})`}>
                      <rect
                        x="-38"
                        y="-8"
                        width="76"
                        height="16"
                        rx="4"
                        fill="#ffffff"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        className="shadow-2xs"
                      />
                      <text
                        textAnchor="middle"
                        y="3.5"
                        fill="#475569"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {edge.relationshipType?.replace(/_/g, " ").slice(0, 11)}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 2. NODES */}
              {layout.positionedNodes.map((node) => {
                const isRoot = node.isRoot;
                const isSelected = selectedNode?.id === node.id;
                const isCurrent = node.status === "CURRENT";
                const isSuperseded = node.status === "SUPERSEDED";
                const isWithdrawn = node.status === "WITHDRAWN";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="node-element cursor-pointer group"
                  >
                    {/* Node Box */}
                    <rect
                      x={isRoot ? "-85" : "-70"}
                      y={isRoot ? "-34" : "-26"}
                      width={isRoot ? "170" : "140"}
                      height={isRoot ? "68" : "52"}
                      rx={isRoot ? "12" : "8"}
                      fill={isRoot ? "#1e293b" : "#ffffff"}
                      stroke={
                        isSelected
                          ? "#3b82f6"
                          : isRoot
                          ? "#0f172a"
                          : isWithdrawn
                          ? "#fca5a5"
                          : isSuperseded
                          ? "#fcd34d"
                          : "#cbd5e1"
                      }
                      strokeWidth={isSelected ? "3" : isRoot ? "2" : "1.5"}
                      filter={isRoot ? "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.06))"}
                    />

                    {/* Root Badge */}
                    {isRoot && (
                      <g transform="translate(0, -22)">
                        <rect x="-45" y="-6" width="90" height="12" rx="3" fill="#3b82f6" />
                        <text
                          textAnchor="middle"
                          y="2.5"
                          fill="#ffffff"
                          fontSize="7.5"
                          fontWeight="700"
                          letterSpacing="0.5"
                        >
                          RECOMMENDED
                        </text>
                      </g>
                    )}

                    {/* Standard Number Text */}
                    <text
                      textAnchor="middle"
                      y={isRoot ? "4" : "-6"}
                      fill={isRoot ? "#ffffff" : "#0f172a"}
                      fontSize={isRoot ? "11.5" : "10"}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.standardNumber}
                    </text>

                    {/* Status indicator line */}
                    <g transform={`translate(0, ${isRoot ? "20" : "12"})`}>
                      <circle
                        cx="-32"
                        cy="-2"
                        r="3"
                        fill={isCurrent ? "#10b981" : isSuperseded ? "#f59e0b" : "#ef4444"}
                      />
                      <text
                        x="-24"
                        y="1"
                        fill={isRoot ? "#94a3b8" : "#64748b"}
                        fontSize="8.5"
                        fontWeight="500"
                      >
                        {node.status || "CURRENT"}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Floating Instruction Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs text-[11px] text-slate-500 font-medium pointer-events-none">
          Showing connected standards up to {depth} relationship level{depth > 1 ? "s" : ""}. Click any node to inspect details.
        </div>

        {/* Selected Node Details Drawer (Right overlay) */}
        {selectedNode && (
          <div className="absolute top-3 right-3 bottom-3 w-80 bg-white rounded-xl border border-slate-200 shadow-xl p-4.5 flex flex-col justify-between z-10 animate-in slide-in-from-right-4 duration-200">
            <div className="space-y-3">
              {/* Header with Close */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    {selectedNode.isRoot ? "Root Recommended Standard" : "Connected Standard"}
                  </span>
                  <h3 className="font-mono text-sm font-bold text-blue-900 mt-0.5">
                    {selectedNode.standardNumber}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Status */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Title</span>
                <p className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">
                  {selectedNode.title || "Standard Specification"}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                <div className="mt-1">
                  {selectedNode.status === "CURRENT" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>CURRENT & ACTIVE</span>
                    </span>
                  ) : selectedNode.status === "SUPERSEDED" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>SUPERSEDED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>WITHDRAWN</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Relationship to Root */}
              {!selectedNode.isRoot && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Relation to {standardQuery}
                  </span>
                  <p className="text-slate-700 font-medium">
                    Referenced in specification or component hierarchy.
                  </p>
                </div>
              )}
            </div>

            {/* Actions: View Standard & Center Graph */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => navigate(`/standards/${encodeURIComponent(selectedNode.standardNumber)}`)}
                className="w-full text-xs font-semibold justify-center shadow-xs"
              >
                <span>View Full Standard Profile</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>

              {!selectedNode.isRoot && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRootChange(selectedNode.standardNumber)}
                  className="w-full text-xs font-medium justify-center text-slate-700"
                >
                  <Network className="w-3 h-3 mr-1 text-slate-500" />
                  <span>Center Graph on {selectedNode.standardNumber}</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trust & Architecture Notice */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Knowledge relationships are stored in PostgreSQL relational tables and traversed on-demand up to 3 levels.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 shrink-0">
          Demo data — verify against authoritative BIS source
        </span>
      </div>
    </div>
  );
};
