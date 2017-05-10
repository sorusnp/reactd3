/**
 * Created by madan <madandhungana@gmail.com>.
 */
import React from 'react';
import MultiSeriesLineChart from "./MultiSeriesLineChart";
import * as d3 from 'd3';
import ChartUtils  from '../utils/ChartUtils';

class EventMultiseriesLineChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
        this.xScale = null;
        this.setScale = this.setScale.bind(this);
        this.eventCircleradius = 5;
    }

    setScale(xScale) {
        this.xScale = xScale;
    }

    /**
     changes csv data according to the need of d3
     */
    type(d, _, columns) {
        let parseTime = d3.timeParse("%Y%m%d");

        let xDomain = this.props.config.columns[0];
        d.xdomain = parseTime(d[xDomain]);
        for (let i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
        return d;
    }


    /**
     Displays tooltip
     */
    displayToolTip(zoomelem) {

        let parseTime = d3.timeParse("%Y%m%d");
        const index = this.props.index;
        const margin = this.props.config.margin;
        const tooltip = d3.select("body")
            .select(`.multiseries-line-chart${index}`)
            .select(`#reactD3Tip${index}`);
        const _events = this.props.events;
        let _eventToDisplay;
        let _toolTipPosition;
        let _currentPageX = d3.mouse(zoomelem)[0];

        // XXX
        let _toolTipPositionY = d3.event.pageY - d3.mouse(zoomelem)[1] - 30;

        _events.forEach(function (_event, index) {
            let _eventX = this.xScale(parseTime(_event.date));
            if (_currentPageX > _eventX - this.eventCircleradius && _currentPageX < _eventX + this.eventCircleradius) {
                _eventToDisplay = _event;
                _toolTipPosition = this.xScale(parseTime(_event.date));
            }
        }.bind(this));

        if (!_eventToDisplay) {
            this.hideToolTip();
            return false;
        }

        tooltip.style("opacity", "1")
            .style("display", "block")
            .html(_eventToDisplay.eventTitle)
            .style("left", _toolTipPosition - margin.left + 7 + "px")
            .style("top", _toolTipPositionY + "px")

    }

    hideToolTip() {
        let index = this.props.index;
        let tooltip = d3.select("body")
            .select(`.multiseries-line-chart${index}`)
            .select(`#reactD3Tip${index}`);
        tooltip.transition()  //Opacity transition when the tooltip disappears
            .duration(500)
            .style("opacity", "0")
            .style("display", "none")
    }

    addEventToChart(width, height, margin) {
        let parseTime = d3.timeParse("%Y%m%d");

        let events = this.props.events;
        let svg = d3.select("body")
            .selectAll(`.multiseries-line-chart${this.props.index}`)
            .selectAll("svg")
            .selectAll(".focus")
            .append("g")
            .attr("clip-path", "url(#clip)")

        let y1 = height;
        let y2 = 10;
        let index = this.props.index;

        events.map(function (d, index) {
            let x = this.xScale(parseTime(d.date));
            let eventGroup = svg.append("g")
                .attr("class", "event-group");
            eventGroup.append("line")
                .attr("class", "event-line")
                .style("stroke", "#e6550d")
                .attr("x1", x)
                .attr("y1", y1)
                .attr("x2", x)
                .attr("y2", y2);

            eventGroup.append("circle")
                .attr("class", "event-circle")
                .attr("cx", x)
                .attr("cy", y2)
                .attr("r", this.eventCircleradius)
                .attr("fill", "#FFF");

            d3.select("body")
                .selectAll(`.multiseries-line-chart${index}`)
                .append("div")
                .attr("class", `react-d3-tip`)
                .attr("id", `reactD3Tip${index}`)
                .style("opacity", "0")
                .style("display", "block");
        }.bind(this));

        let zoomelem = d3.select("body")
            .selectAll(`.multiseries-line-chart${this.props.index}`)
            .selectAll("svg")
            .selectAll(".zoom");

        //This is a simple hack to diplay tooltip when zoom is false
        if (zoomelem["_groups"][0].length === 0) {
            let svg = d3.select('body')
                .selectAll(`.multiseries-line-chart${this.props.index}`)
                .select('svg');

            zoomelem = svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill-opacity", 0)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        }

        zoomelem.on("mousemove", function () {
            const zoomrect = zoomelem["_groups"][0][0];
            this.displayToolTip(zoomrect)
        }.bind(this));
    }

    /**
     returns xscale from given data and width
     @param data Data from the componet
     @param width Width of the chart.
     */
    getXScale(data, width) {
        let xScale;
        let chartUtils = new ChartUtils();

        if (this.props.config.xAxis.type === 'datetime') {
            xScale = chartUtils.getTimeXScale(width);
            xScale.domain(d3.extent(data, (d) => {
                return d.xdomain;
            }));
        } else if (this.props.config.xAxis.type === 'linear') {
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

        return xScale;
    }

    componentDidMount() {
        let config = this.props.config;
        let margin = this.props.config.margin;
        let width = this.props.config.width ? this.props.config.width - (margin.left + margin.right) : 500;
        let height = this.props.config.height ? this.props.config.height - (margin.top + margin.bottom) : 500;

        d3.csv(config.url, this.type.bind(this), function (error, data) {
            if (error) {
                console.error(error);
            } else {
                this.setState({
                    data: data
                });
                let xScale = this.getXScale(data, width);
                this.setScale(xScale);
                this.addEventToChart(width, height, margin);
            }
        }.bind(this));
    }

    render() {
        let id = this.props.index;
        return (
            <div className={'multiseries-line-chart' + id}>
                <MultiSeriesLineChart {...this.props} setScale={this.setScale} data={this.state.data}/>
            </div>
        )
    }
}

export default EventMultiseriesLineChart;
