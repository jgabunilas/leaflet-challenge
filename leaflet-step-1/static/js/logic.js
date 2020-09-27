// Leaflet Part 1
// Written by Jason Gabunilas


// This function will return a color based on a number. It will be used to generate marker colors based on the magnitude of the earthquake
var getColor = function(value) {
        if (value < 0) {
                return '#D9F660'
        } else if (value < 40) {
                return '#B5D568'
        } else if (value < 80) {
                return '#92B471'
        } else if (value < 120) {
                return '#6F937A'
        } else if (value < 160) {
                return '#4B7282'
        } else if (value < 200) {
                return '#28518B'
        } else {
                return '#053194'
        } 
}




// The function markEarthquakes will take as an argument the data provided by the JSON query and construct a marker group from it
var markEarthquakes = function(earthquakeData) {

        // Initialize an array to hold earthquake markers
        var earthquakeMarkers = [];
        var deptharray = [];
        for (i = 0; i < earthquakeData.length; i++) {
                // console.log(i)

                // Extract the latitude, longitude, depth, and magnitude data from the coordinates array of the geometry
                var lon = earthquakeData[i].geometry.coordinates[0];
                var lat = earthquakeData[i].geometry.coordinates[1];
                var depth = earthquakeData[i].geometry.coordinates[2];
                var mag = earthquakeData[i].properties.mag;
                var place = earthquakeData[i].properties.place;
                // console.log(earthquakeData[i].geometry.coordinates)
                // console.log(lat,lon)
                deptharray.push(depth)


                // Create a circle for each earthquake. The popup will include information about the lication
                var earthquakeMarker = L.circle([lat, lon], {
                        // Scale the radius by the magnitude of the earthquake
                        radius: 50000 * mag,
                        color: '#000000',
                        weight: 1,
                        // Set the color of the circle based on the depth of the earthquake
                        fillColor: getColor(depth)
                }).bindPopup(`<h3>Location:${place}</h3><p>Magnitude: ${mag}</p>`)

                // Add marker to the earthquakeMarkers array
                earthquakeMarkers.push(earthquakeMarker)
                
        }
        // console.log(Math.max(...deptharray))
        // console.log(Math.min(...deptharray))
        // console.log(earthquakeMarkers)
        var earthquakeMarkersGroup = L.layerGroup(earthquakeMarkers)

        // Call the createMap function
        createMap(earthquakeMarkersGroup)

}

var createMap = function(earthquakeMarkers) {



        var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
                attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
                tileSize: 512,
                maxZoom: 18,
                zoomOffset: -1,
                id: "mapbox/light-v10",
                accessToken: API_KEY
        });

        var baseMaps = {
                "Light Map": lightmap
        };

        var overlayMaps = {
                Earthquakes: earthquakeMarkers
        };

        var myMap = L.map("mapid", {
                center: [37.09, -95.71],
                zoom: 3,
                layers: [lightmap, earthquakeMarkers],
                // The worldCopyJump option repopulates the markers when the map is scrolled.
                worldCopyJump: true
        });


        // Create a legend and create a div to add to the map
        var info = L.control({
                position: "bottomleft"
        });
        info.onAdd = function() {
                var div = L.DomUtil.create("div", "legend");
                var limits = [
                        '<0 - 39',
                        '40 - 79',
                        '80 - 119',
                        '120 - 159',
                        '160 - 199',
                        '>200'
                ];
                var colors = [
                        '#D9F660',
                        '#B5D568',
                        '#92B471',
                        '#6F937A',
                        '#4B7282',
                        '#28518B',
                        '#053194'
                ];
                var labels = [];

                var legendInfo = "<h2>Earthquake Depth</h2>"

                div.innerHTML = legendInfo;

                // limits.forEach(function(limit, index) {
                //         labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
                // });

                limits.forEach(function(limit, index) {
                        labels.push(`<div style=\"background-color: ${colors[index]}"\"><h3>${limit}</h3></div>`);
                });
                
                div.innerHTML += "<ul>" + labels.join("") + "</ul>";
                return div;
        };
        // Add the info legend to the map
        info.addTo(myMap);

        // L.control.layers(null, overlayMaps, {
        //         collapsed: false
        // }).addTo(myMap);



};

// Use d3 to query the URL for the geoJSON data. This is the data represents all earthquares from the past day
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
d3.json(url, function(response) {
        // console.log(response)

        // Call the markEarthquakes function, passing in the features of the geoJSON response
        markEarthquakes(response.features)
})
