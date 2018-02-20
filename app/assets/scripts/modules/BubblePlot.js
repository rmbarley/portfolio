import * as d3 from 'd3';
import * as d3Chromatic from 'd3-scale-chromatic';

const height = 600;
const width = 1200;
const color = d3.scaleOrdinal(d3Chromatic.schemePastel2);

const svg = d3
  .select('.chart')
  .append('svg')
  .attr('height', height)
  .attr('width', width)
  .attr('padding-top', '20px')
  .append('g')
  .attr('transform', 'translate(0, 0)');
const div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);
const radiusScale = d3
  .scaleSqrt()
  .domain([25, 100])
  .range([30, 60]);
// send bubbles to middle
const forceXSeparate = d3
  .forceX(d => {
    if (d.grouping === 'frontend') {
      return 175;
    } else if (d.grouping === 'other') {
      return 1000;
    } else {
      return width / 2 - 30;
    }
  })
  .strength(0.09);
const forceXCombine = d3.forceX(width / 2).strength(0.06);
const forceCollide = d3.forceCollide(d => {
  return radiusScale(d.strength);
});

const simulation = d3
  .forceSimulation()
  .force('x', forceXCombine)
  .force('y', d3.forceY(height / 2).strength(0.09))
  .force('collide', forceCollide);

d3
  .queue()
  .defer(d3.csv, './assets/data/data.csv')
  .await(ready);

function ready(err, data) {
  let circles = svg
    .selectAll('.skill')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', d => {
      return radiusScale(d.strength);
    })
    .attr('class', 'skill')
    .attr('fill', function(d) {
      return color(d.strength);
    })
    .on('mouseover', function(d) {
      div
        .transition()
        .duration(200)
        .style('opacity', 0.9);
      div
        .html(d.name)
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px');
    })
    .on('mouseout', function(d) {
      div
        .transition()
        .duration(500)
        .style('opacity', 0);
    });
  let skillBar = d3.select('.skill-categories');

  d3.select('#group').on('click', d => {
    skillBar.classed('hidden', false);

    simulation
      .force('x', forceXSeparate)
      .alphaTarget(0.8)
      .restart();
  });

  d3.select('#combine').on('click', () => {
    skillBar.classed('hidden', true);

    simulation
      .force('x', forceXCombine)
      .alphaTarget(0.4)
      .restart();
  });

  simulation.nodes(data).on('tick', ticked);

  function ticked() {
    circles
      .attr('cx', d => {
        return d.x;
      })
      .attr('cy', d => {
        return d.y;
      });
    texts
      .attr('x', d => {
        return d.x - 20;
      })
      .attr('y', d => {
        return d.y - 20;
      });
  }
  let texts = svg
    .selectAll(null)
    .data(data)
    .enter()
    .append('image')
    .attr('width', 40)
    .attr('height', 40)
    .attr('href', d => {
      return d.icon;
    })
    .on('mouseover', function(d) {
      div
        .transition()
        .duration(200)
        .style('opacity', 0.9);
      div
        .html(d.name)
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px');
    })
    .on('mouseout', function(d) {
      div
        .transition()
        .duration(500)
        .style('opacity', 0);
    });
}
