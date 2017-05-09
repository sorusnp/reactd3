/**
 * Created by madan <madandhungana@gmail.com>.
 */
import React from 'react';
import LineChart from "./LineChart";
import * as d3 from 'd3';

class EventLineChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
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
