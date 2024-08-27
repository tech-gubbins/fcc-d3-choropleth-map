const educationDataUrl =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyDataUrl =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(educationDataUrl), d3.json(countyDataUrl)])
    .then(([educationData, countyData]) =>
        createChoroplethMap(educationData, countyData)
    )
    .catch((err) => console.error(err));

function createChoroplethMap(educationData, countyData) {
    const svg = d3.select("#choropleth");
    const path = d3.geoPath();

    const colorScale = d3
        .scaleThreshold()
        .domain([10, 20, 30, 40])
        .range(d3.schemeBlues[5]);

    const counties = topojson.feature(
        countyData,
        countyData.objects.counties
    ).features;

    svg.selectAll("path")
        .data(counties)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("fill", (d) => {
            const county = educationData.find((ed) => ed.fips === d.id);
            return county ? colorScale(county.bachelorsOrHigher) : "#ccc";
        })
        .attr("data-fips", (d) => d.id)
        .attr("data-education", (d) => {
            const county = educationData.find((ed) => ed.fips === d.id);
            return county ? county.bachelorsOrHigher : 0;
        })
        .on("mouseover", function (event, d) {
            const county = educationData.find((ed) => ed.fips === d.id);
            d3.select("#tooltip")
                .style("opacity", 0.9)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`)
                .attr("data-education", county ? county.bachelorsOrHigher : 0)
                .html(
                    `${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`
                );
        })
        .on("mouseout", function () {
            d3.select("#tooltip").style("opacity", 0);
        });

    const legend = d3.select("#legend");

    const legendThreshold = d3
        .scaleThreshold()
        .domain([10, 20, 30, 40])
        .range(d3.schemeBlues[5]);

    const legendScale = d3.scaleLinear().domain([0, 50]).range([0, 300]);

    const legendAxis = d3
        .axisBottom(legendScale)
        .tickSize(13)
        .tickValues(legendThreshold.domain());

    legend.call(legendAxis).select(".domain").remove();

    legend
        .selectAll("rect")
        .data(
            legendThreshold.range().map((color, i) => {
                const d = legendThreshold.invertExtent(color);
                if (d[0] == null) d[0] = legendScale.domain()[0];
                if (d[1] == null) d[1] = legendScale.domain()[1];
                return d;
            })
        )
        .enter()
        .insert("rect", ".tick")
        .attr("height", 8)
        .attr("x", (d) => legendScale(d[0]))
        .attr("width", (d) => legendScale(d[1]) - legendScale(d[0]))
        .attr("fill", (d) => legendThreshold(d[0]));
}
