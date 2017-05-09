/**
 * Created by madan <madandhungana@gmail.com>.
 */
import React from 'react';
import LineChart from "./LineChart";
import * as d3 from 'd3';

class EventLineChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: []
        }
    }

    addEventToChart() {
        let svg = d3.select("body")
            .selectAll(`.lineChart${this.props.index}`)
            .select("svg");
        let events = this.props.events;

        events.map(function (index, d) {
            const x = 80 * (d + 1);
            const y1 = this.props.config.height - this.props.config.margin.bottom;
            const y2 = this.props.config.margin.top + 10;
            svg.append("line")
                .style("stroke", "red")
                .style("stroke-dasharray", "1, 5")
                .attr("x1", x)
                .attr("y1", y1)
                .attr("x2", x)
                .attr("y2", y2);
        }.bind(this));
    }

    componentDidMount() {
        let column = this.props.config.columns;
        let yDomain = column[1];
        const dataUrl = this.props.config.url;
        d3.csv(dataUrl, function (d) {
            d[yDomain] = +d[yDomain];
            return d;
        }, function (error, data) {
            if (error) {
                console.error(error);
            } else {
                this.setState({
                    data: data
                });
                this.addEventToChart();
            }
        }.bind(this));
    }

    render() {
        let id = this.props.index;
        return (
            <div className={'lineChart' + id}>
                <LineChart {...this.props} data={this.state.data}/>
            </div>
        )
    }
}

export default EventLineChart;
