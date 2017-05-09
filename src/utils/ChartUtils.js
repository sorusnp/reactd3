/**
 * Created by madan on 5/8/17.
 */
import * as d3 from 'd3';

class ChartUtils {
    constructor() {

    }

    getPointXScale(width){
        return d3.scalePoint()
            .rangeRound([0, width]);
    }

    getLinearYScale(height){
        return d3.scaleLinear()
            .range([height, 0]);
    }

    getTimeXScale(width){
        return d3.scaleTime()
            .range([0, width]);
    }

    getLinearXScale(width){
        return d3.scaleLinear()
            .range([0, width]);

    }

    getBandXScale(width,padding){
        return d3.scaleBand()
            .rangeRound([0,width])
            .padding(padding?padding:0.1)
    }

    getOrdinalZAxis(schemeCategory){
        return d3.scaleOrdinal(schemeCategory);
    }

    createXAxisButtom(g,height,xScale){
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));
    }

    createYAxisButtom(g,height,marginLeft,axisTitle,yScale){
        let axisLevelMargin = 5;
        g.append("g")
            .call(d3.axisLeft(yScale))
            .attr("class", "axis axis--y")
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "translate(0,"+height/2+") rotate(-90)")
            .attr("y", -marginLeft+axisLevelMargin)
            .attr("dy", "0.71em")
            .attr("text-anchor", "middle")
            .text(axisTitle);
    }

}

export default ChartUtils;