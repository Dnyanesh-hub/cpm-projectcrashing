import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { ActivityNode } from '../../types';

interface Props {
  activities: ActivityNode[];
  criticalPath: string[];
  width?: number;
  height?: number;
}

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  isCritical: boolean;
  es: number; ef: number; ls: number; lf: number;
  slack: number; duration: number;
}
interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  isCritical: boolean;
}

export function NetworkGraph({ activities, criticalPath, width = 900, height = 520 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const criticalSet = useMemo(() => new Set(criticalPath), [criticalPath]);

  useEffect(() => {
    if (!svgRef.current || activities.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svg.append('g').attr('class', 'container');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (e) => container.attr('transform', e.transform.toString()));
    svg.call(zoom);

    const defs = svg.append('defs');
    const makeArrow = (id: string, color: string) => {
      defs.append('marker').attr('id', id).attr('viewBox', '0 -5 10 10')
        .attr('refX', 32).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color);
    };
    makeArrow('arrow-normal', 'rgba(0,245,255,0.6)');
    makeArrow('arrow-critical', '#ff3860');

    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const nodes: NodeDatum[] = activities.map(a => ({
      id: a.id, label: a.name, isCritical: criticalSet.has(a.id),
      es: a.es, ef: a.ef, ls: a.ls, lf: a.lf, slack: a.slack, duration: a.currentDuration,
    }));

    const links: LinkDatum[] = [];
    activities.forEach(a => {
      (a.predecessors || []).forEach(pred => {
        if (activities.find(x => x.id === pred)) {
          links.push({ source: pred, target: a.id, isCritical: criticalSet.has(pred) && criticalSet.has(a.id) });
        }
      });
    });

    const simulation = d3.forceSimulation<NodeDatum>(nodes)
      .force('link', d3.forceLink<NodeDatum, LinkDatum>(links).id(d => d.id).distance(150).strength(1))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(70))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04));

    const link = container.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', d => d.isCritical ? '#ff3860' : 'rgba(0,245,255,0.35)')
      .attr('stroke-width', d => d.isCritical ? 2.5 : 1.5)
      .attr('stroke-dasharray', d => d.isCritical ? 'none' : '6 3')
      .attr('marker-end', d => d.isCritical ? 'url(#arrow-critical)' : 'url(#arrow-normal)');

    const node = container.append('g').selectAll<SVGGElement, NodeDatum>('g').data(nodes).join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, NodeDatum>()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    const BOX_W = 112, BOX_H = 78;
    node.append('rect')
      .attr('x', -BOX_W / 2).attr('y', -BOX_H / 2).attr('width', BOX_W).attr('height', BOX_H)
      .attr('rx', 8).attr('ry', 8)
      .attr('fill', d => d.isCritical ? 'rgba(255,56,96,0.12)' : 'rgba(0,245,255,0.07)')
      .attr('stroke', d => d.isCritical ? '#ff3860' : 'rgba(0,245,255,0.5)')
      .attr('stroke-width', d => d.isCritical ? 2 : 1)
      .attr('filter', d => d.isCritical ? 'url(#glow)' : '');

    const tableTop = -BOX_H / 2 + 4;
    const cellH = 18;

    node.append('line').attr('x1', -BOX_W / 2 + 4).attr('x2', BOX_W / 2 - 4)
      .attr('y1', tableTop + cellH).attr('y2', tableTop + cellH).attr('stroke', 'rgba(255,255,255,0.1)');
    node.append('line').attr('x1', 0).attr('x2', 0)
      .attr('y1', tableTop).attr('y2', tableTop + cellH * 2).attr('stroke', 'rgba(255,255,255,0.1)');

    node.append('text').text(d => `ES:${d.es}`).attr('x', -BOX_W / 2 + 6).attr('y', tableTop + 13)
      .attr('font-size', 9).attr('fill', 'rgba(0,245,255,0.8)').attr('font-family', 'Fira Code, monospace');
    node.append('text').text(d => `EF:${d.ef}`).attr('x', 4).attr('y', tableTop + 13)
      .attr('font-size', 9).attr('fill', 'rgba(0,245,255,0.8)').attr('font-family', 'Fira Code, monospace');
    node.append('text').text(d => `LS:${d.ls}`).attr('x', -BOX_W / 2 + 6).attr('y', tableTop + 29)
      .attr('font-size', 9).attr('fill', 'rgba(255,183,0,0.8)').attr('font-family', 'Fira Code, monospace');
    node.append('text').text(d => `LF:${d.lf}`).attr('x', 4).attr('y', tableTop + 29)
      .attr('font-size', 9).attr('fill', 'rgba(255,183,0,0.8)').attr('font-family', 'Fira Code, monospace');

    node.append('line').attr('x1', -BOX_W / 2 + 4).attr('x2', BOX_W / 2 - 4)
      .attr('y1', tableTop + cellH * 2 + 2).attr('y2', tableTop + cellH * 2 + 2).attr('stroke', 'rgba(255,255,255,0.15)');

    node.append('text').text(d => d.id).attr('y', tableTop + cellH * 2 + 16)
      .attr('text-anchor', 'middle').attr('font-size', 14).attr('font-weight', 'bold')
      .attr('fill', d => d.isCritical ? '#ff3860' : '#00f5ff').attr('font-family', 'Space Mono, monospace');

    node.append('text').text(d => d.label.length > 13 ? d.label.substring(0, 12) + '…' : d.label)
      .attr('y', tableTop + cellH * 2 + 30).attr('text-anchor', 'middle')
      .attr('font-size', 8.5).attr('fill', 'rgba(255,255,255,0.5)').attr('font-family', 'DM Sans, sans-serif');

    node.append('text').text(d => `S=${d.slack}`)
      .attr('x', BOX_W / 2 - 4).attr('y', -BOX_H / 2 + 10).attr('text-anchor', 'end')
      .attr('font-size', 8).attr('fill', d => d.slack === 0 ? '#ff3860' : 'rgba(57,255,20,0.8)')
      .attr('font-family', 'Fira Code, monospace');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeDatum).x!)
        .attr('y1', d => (d.source as NodeDatum).y!)
        .attr('x2', d => (d.target as NodeDatum).x!)
        .attr('y2', d => (d.target as NodeDatum).y!);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    setTimeout(() => {
      const bounds = (container.node() as SVGGElement).getBBox();
      if (bounds.width > 0) {
        const scale = Math.min(0.9, Math.min((width - 60) / bounds.width, (height - 60) / bounds.height));
        const tx = (width - bounds.width * scale) / 2 - bounds.x * scale;
        const ty = (height - bounds.height * scale) / 2 - bounds.y * scale;
        svg.transition().duration(700).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
      }
    }, 900);

    return () => simulation.stop();
  }, [activities, criticalSet, width, height]);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg ref={svgRef} width={width} height={height} className="w-full h-full" style={{ background: 'transparent' }} />
      <div className="absolute bottom-3 left-3 glass-card px-3 py-2 flex gap-4 text-xs font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 inline-block bg-red-500 rounded" />
          Critical Path
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-px inline-block border-t border-dashed" style={{ borderColor: 'rgba(0,245,255,0.6)' }} />
          Normal
        </span>
        <span className="text-slate-500">Drag • Scroll zoom</span>
      </div>
    </div>
  );
}
