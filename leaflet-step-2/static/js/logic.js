// Leaflet Part 2
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
                        radius: 35000 * mag,
                        color: '#000000',
                        weight: 1,
                        // Set the color of the circle based on the depth of the earthquake
                        fillColor: getColor(depth),
                        fillOpacity: 0.5
                }).bindPopup(`<h3>Location:${place}</h3><p>Magnitude: ${mag}</p>`)

                // Add marker to the earthquakeMarkers array
                earthquakeMarkers.push(earthquakeMarker)
                
        }
        // console.log(Math.max(...deptharray))
        // console.log(Math.min(...deptharray))
        // console.log(earthquakeMarkers)
        var earthquakeMarkersGroup = L.layerGroup(earthquakeMarkers)


        // Call the createMap function
        // createMap(earthquakeMarkersGroup)
        return earthquakeMarkersGroup

};

// The markPlates function takes the "features" of the techtonic plates JSON response and creates a layer from these features using L.geoJSON
var markPlates = function(plateData) {
        return L.geoJSON(plateData)
        
}

var createMap = function(earthquakeMarkers, plateMarkers) {


        var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
                attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
                tileSize: 512,
                maxZoom: 18,
                zoomOffset: -1,
                id: "mapbox/light-v10",
                accessToken: API_KEY
        });

        var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
                attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
                tileSize: 512,
                maxZoom: 18,
                zoomOffset: -1,
                id: "mapbox/dark-v10",
                accessToken: API_KEY
        });

        var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
                attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
                tileSize: 512,
                maxZoom: 18,
                zoomOffset: -1,
                id: "mapbox/satellite-v9",
                accessToken: API_KEY
        });
        

        // Add the base layers
        var baseMaps = {
                "Light Map": lightmap,
                "Dark Map": darkmap,
                "Geographical Map": satellitemap
        };

        // Add the overlay layers
        var overlayMaps = {
                'Earthquakes': earthquakeMarkers,
                'Techtonic Plates': plateMarkers
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
                var div = L.DomUtil.create("div", "info legend");
                var limits = [
                        '<0',
                        '0 - 39',
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
                // Legend heading
                var legendInfo = "<h3>Earthquake Depth</h3>"

                div.innerHTML = legendInfo;

                for (var i = 0; i < limits.length; i++) {
                        div.innerHTML +=
                            '<i style="background:' + (colors[i]) + '"></i> ' +
                            limits[i] + '<br>';
                    }

                return div;
        };
        // Add the info legend to the map
        info.addTo(myMap);



        // Add layer control
        L.control.layers(baseMaps, overlayMaps, {
                collapsed: false
        }).addTo(myMap);
};

// Use d3 to query the URL for the geoJSON earthquake data. This is the data represents all earthquakes from the past day
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
d3.json(url, function(response1) {

        // Use a nested d3.json call on the techtonic plates JSON file
        d3.json('static/data/plates.json', function(response2) {
                // Call the createMap function and pass in the responses from the markEarthquakes and markPlates functions, with their respective JSON responses as input values
                createMap(markEarthquakes(response1.features), markPlates(response2.features)
                )
        })

})



