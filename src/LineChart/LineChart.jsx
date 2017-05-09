import React from 'react';

import * as d3 from 'd3';

import ChartUtils  from '../utils/ChartUtils';

class LineChart extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    createLineChart(newProps) {
        let chartUtils = new ChartUtils();
        const column = this.props.config.columns;
        const xDomain = column[0];
        const yDomain = column[1];
        let defaultMargin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        };
        const margin = this.props.config.margin ? this.props.config.margin : defaultMargin;
        let width = this.props.config.width ? this.props.config.width - (margin.left + margin.right) : 300;
        let height = this.props.config.height ? this.props.config.height - (margin.top + margin.bottom) : 300;

        let data = newProps.data;
        let xScale = chartUtils.getPointXScale(width);
        let yScale = chartUtils.getLinearYScale(height);

        xScale.domain(data.map(function (d) {
            return d[xDomain];
        }));

        yScale.domain(d3.extent(data, function (d) {
            return +d[yDomain];
        }));

        let line = d3.line()
            .x(function (d) {
                return xScale(d[xDomain]);
            })
            .y(function (d) {
                return yScale(+d[yDomain]);
            });
        let svg = d3.select("body")
            .selectAll(`.lineChart${this.props.index}`)
            .selectAll("svg");

        svg.selectAll("*").remove();

        let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        chartUtils.createXAxisButtom(g, height, xScale);
        chartUtils.createYAxisButtom(g, height, margin.left, yDomain, yScale)

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        let focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 4);

        focus.append("text")
            .attr("x", 9);

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .attr("fill-opacity", 0)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .on("mouseover", function () {
                focus.style("display", null);
            })
            .on("mouseout", function () {
                focus.style("display", "none");
            })
            .on("mousemove", mousemove);


        function mousemove() {
            let cursorX = d3.mouse(this)[0];
            let index = Math.floor(cursorX / xScale.step());

            let currentData = data[index];

            let focusX = xScale(currentData[xDomain]) + margin.left;
            let focusY = yScale(currentData[yDomain]) + margin.top;
            focus.attr("transform", `translate(${focusX},${focusY})`);
            focus.select("text").text(currentData[yDomain]);

        }
    }

    componentWillReceiveProps(newProps) {
        this.createLineChart(newProps);
    }

    render() {
        let width = this.props.config.width ? this.props.config.width : 200;
        let height = this.props.config.height ? this.props.config.height : 300;
        return (
            <svg width={width} height={height}/>
        );
    }
}

export default LineChart;
