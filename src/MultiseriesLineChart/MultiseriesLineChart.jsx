/**
 * Created by madan <madandhungana@gmail.com>.
 */
import React from 'react';
import * as d3 from 'd3';

import ChartUtils  from '../utils/ChartUtils';

class MultiSeriesLineChart extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    createMultiSeriesLineChart(newProps) {
        let chartUtils = new ChartUtils();

        let margin = newProps.config.margin;
        let width = newProps.config.width ? newProps.config.width - (margin.left + margin.right) : 500;
        let height = newProps.config.width ? newProps.config.height - (margin.top + margin.bottom) : 500;
        let data = newProps.data;
        let index = newProps.index;

        let svg = d3.select('body')
            .selectAll(`.multiseries-line-chart${this.props.index}`)
            .select('svg');

        //Removes all child component from svg
        svg.selectAll("*").remove();

        //Clip path so that zooming the graph does not overflow.
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        let g = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let xScale;

        if (newProps.config.xAxis.type === 'datetime') {
            xScale = chartUtils.getTimeXScale(width);
            xScale.domain(d3.extent(data, (d) => {
                return d.xdomain;
            }));
        } else if (newProps.config.xAxis.type === 'linear') {
            xScale = chartUtils.getLinearXScale(width);
            xScale.domain(d3.extent(data, (d) => {
                return +d.xdomain;
            }));
        } else {
            xScale = chartUtils.getPointXScale(width);
            xScale.domain(data.map((d) => {
                return d.xdomain;
            }));
        }

        if (this.props.xScale) {
            this.props.xScale(xScale);
        }
        let yScale = chartUtils.getLinearYScale(height);
        let zScale = chartUtils.getOrdinalZAxis(d3.schemeCategory10);

        let line = d3.line()
            .curve(d3.curveMonotoneX)
            .x((d) => {
                return xScale(d.xdomain);
            })
            .y((d) => {
                return yScale(d.ydomain);
            });

        /**
         * change data to individual form of json array
         *    eg: [object,object,object]
         */
        let changedData = data.columns.slice(1).map((id) => {
            return {
                id: id,
                values: data.map((d) => {
                    return {
                        xdomain: d.xdomain,
                        ydomain: d[id]
                    };
                })
            };
        });

        /**
         *    Sets y-scale domain as minimum and maximum value from given data
         */
        yScale.domain([
            d3.min(changedData, (c) => {
                return d3.min(c.values, (d) => {
                    return d.ydomain;
                });
            }),
            d3.max(changedData, (c) => {
                return d3.max(c.values, (d) => {
                    return d.ydomain;
                });
            })
        ]);

        zScale.domain(changedData.map((c) => {
            return c.id;
        }));

        let xScaleInitialDomain = xScale.domain();

        chartUtils.createXAxisButtom(g, height, xScale);
        chartUtils.createYAxisButtom(g, height, margin.left, newProps.config.yAxis.title, yScale);

        let multiSeriesLine = g.selectAll(".multi-series-line")
            .data(changedData)
            .enter().append("g")
            .attr("clip-path", "url(#clip)")
            .attr("class", "multi-series-line");

        multiSeriesLine.append("path")
            .attr("class", "line")
            .attr("fill-opacity", 0)
            .attr("d", (d) => {
                return line(d.values);
            })
            .style("stroke", (d) => {
                return zScale(d.id);
            });

        if (newProps.config.legend.enable) {
            const _gapBetweenLegend = 30;
            const _gapBetweenLegendAndGraph = 20;
            let legend = svg.append("g")
                .attr("transform", "translate(" + (width + margin.left + _gapBetweenLegendAndGraph) + "," + margin.top + ")")
                .selectAll(".legend")
                .data(changedData)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", (d, index) => {
                    return "translate(0," + (index * _gapBetweenLegend) + ")"
                });

            legend.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("transform", "translate(0,0)")
                .style("fill", (d) => {
                    return zScale(d.id);
                });

            legend.append("text")
                .datum((d) => {
                    return {id: d.id, value: d.values[d.values.length - 1]};
                })
                .attr("x", 3)
                .attr("transform", "translate(20,5)")
                .attr("dy", "0.35em")
                .style("font", "10px sans-serif")
                .style("fill", "black")
                .text((d) => {
                    return d.id;
                });
        }

        let brush = d3.brushX()
            .on("end", brushed);

        function addBrush() {
            multiSeriesLine.append("g")
                .attr("class", "brush")
                .attr("fill-opacity", 0)
                .call(brush);
        }

        let zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);


        if (newProps.config.zoom) {
            svg.append("rect")
                .attr("class", "zoom")
                .attr("width", width)
                .attr("height", height)
                .attr("fill-opacity", 0)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(zoom);
        } else if (newProps.config.brush) {
            addBrush();
        }

        let setScale = this.props.setScale;

        function zoomed() {
            const t = d3.event.transform;
            let xScaleTransfomed = t.rescaleX(xScale);
            g.select(".axis--x").call(d3.axisBottom(xScaleTransfomed));
            g.select(".axis--y").call(d3.axisLeft(t.rescaleY(yScale)));
            g.selectAll("path.line")
                .attr("transform", `translate(${t.x}, ${t.y}) scale(${t.k})`);

            svg.selectAll(".event-group")
                .attr("transform", `translate(${t.x},0) scale(${t.k},1)`);

            if (setScale) {
                setScale(xScaleTransfomed);
            }
        }

        function brushed() {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

            let s = d3.event.selection;
            xScale.domain(d3.event.selection ? s.map(xScale.invert, xScale) : xScaleInitialDomain);
            g.select(".axis--x").call(d3.axisBottom(xScale));
            g.selectAll("path.line").attr("d", function (d) {
                return line(d.values)
            });
            g.selectAll(".brush").remove();
            addBrush();
        }

        const _chartTitle = this.props.config.title;
        const _chartSubTitle = this.props.config.subtitle.text;
        if (_chartTitle || _chartSubTitle) {
            let title = svg.append("g")
                .attr("class", "chart-title");

            title.append("text")
                .attr("x", 3)
                .attr("transform", `translate(${width / 2},${margin.top / 2})`)
                .attr("dy", "0.35em")
                .style("font", "18px sans-serif")
                .style("fill", "black")
                .text(_chartTitle);

            title.append("text")
                .attr("x", 3)
                .attr("transform", `translate(${width / 2 + 10},${margin.top / 2 + 18})`)
                .attr("dy", "0.35em")
                .style("font", "10px sans-serif")
                .style("fill", "black")
                .text(_chartSubTitle);
        }
    }


    componentWillReceiveProps(newProps) {
        this.createMultiSeriesLineChart(newProps);
    }

    render() {
        let width = this.props.config.width ? this.props.config.width : 500;
        let height = this.props.config.height ? this.props.config.height : 500;
        return (
            <svg height={height} width={width}/>
        );
    }

}

export default MultiSeriesLineChart;
