/**
 * Created by madan <madandhungana@gmail.com>.
 */
import React from 'react';
import MultiSeriesLineChart from "./MultiseriesLineChart";
import * as d3 from 'd3';

class SimpleMultiseriesLineChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    type(d, _, columns) {
        let parseTime = d3.timeParse("%Y%m%d");

        let xDomain = this.props.config.columns[0];
        d.xdomain = parseTime(d[xDomain]);
        for (let i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
        return d;
    }

    componentDidMount() {
        let config = this.props.config;
        d3.csv(config.url, this.type.bind(this), function (error, data) {
            if (error) {
                console.error(error);
            } else {
                this.setState({
                    data: data
                });
            }
        }.bind(this));
    }

    render() {
        let id = this.props.index;
        return (
            <div className={'multiseries-line-chart' + id}>
                <MultiSeriesLineChart {...this.props} data={this.state.data}/>
            </div>
        )
    }
}

export default SimpleMultiseriesLineChart;
