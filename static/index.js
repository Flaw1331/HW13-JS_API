// Update the Metadata Tab
function updateMetaData(data) {

    // Finding the element
    var PANEL = document.getElementById("sample-metadata");

    // Clear any existing metadata
    PANEL.innerHTML = '';

    // Build new Meta Data Tab
    for(var key in data) {
        ptag = document.createElement("p");
        pText = document.createTextNode(`${key}: ${data[key]}`);
        ptag.append(pText);
        PANEL.appendChild(ptag);
    }
}

// Builds the new charts
function buildCharts(sampleData, otuData) {

    // Loop through sample data and find the OTU Taxonomic Name
    var labels = sampleData[0]['otu_ids'].map(function(item) {
        return otuData[item]
    });

    // Build Bubble Chart
    var bubbleLayout = {
        margin: { t: 0 },
        hovermode: 'closest',
        xaxis: { title: 'OTU ID' }
    };

    var bubbleData = [{
        x: sampleData[0]['otu_ids'],
        y: sampleData[0]['sample_values'],
        text: labels,
        mode: 'markers',
        marker: {
            size: sampleData[0]['sample_values'],
            color: sampleData[0]['otu_ids'],
            colorscale: "Earth",
        }
    }];

    var BUBBLE = document.getElementById('bubble');
    Plotly.plot(BUBBLE, bubbleData, bubbleLayout);

    // Build Pie Chart
    console.log(sampleData[0]['sample_values'].slice(0, 10))
    var pieData = [{
        values: sampleData[0]['sample_values'].slice(0, 10),
        labels: sampleData[0]['otu_ids'].slice(0, 10),
        hovertext: labels.slice(0, 10),
        hoverinfo: 'hovertext',
        type: 'pie'
    }];

    var pieLayout = {
        margin: { t: 0, l: 0 }
    };

    var PIE = document.getElementById('pie');
    Plotly.plot(PIE, pieData, pieLayout);
};

// Update the charts after initial build
function updateCharts(sampleData, otuData) {

    // Defining Values
    var sampleValues = sampleData[0]['sample_values'];
    var otuIDs = sampleData[0]['otu_ids'];

    // Return the OTU Description for each otuID in the dataset
    var labels = otuIDs.map(function(item) {
        return otuData[item]
    });

    // Update the Bubble Chart
    var BUBBLE = document.getElementById('bubble');
    Plotly.restyle(BUBBLE, 'x', [otuIDs]);
    Plotly.restyle(BUBBLE, 'y', [sampleValues]);
    Plotly.restyle(BUBBLE, 'text', [labels]);
    Plotly.restyle(BUBBLE, 'marker.size', [sampleValues]);
    Plotly.restyle(BUBBLE, 'marker.color', [otuIDs]);

    // Update the Pie Chart
    var PIE = document.getElementById('pie');

    var pieUpdate = {
        values: [sampleValues.slice(0, 10)],
        labels: [otuIDs.slice(0, 10)],
        hovertext: [labels.slice(0, 10)],
        hoverinfo: 'hovertext',
        type: 'pie'
    };

    Plotly.restyle(PIE, pieUpdate);
}

// Grabbing the data
function getData(sample, callback) {

    // Use a request to grab the json data needed for all charts - Error checking built in
    Plotly.d3.json(`/samples/${sample}`, function(error, sampleData) {
        if (error) return console.warn(error);
        Plotly.d3.json('/otu', function(error, otuData) {
            if (error) return console.warn(error);
            callback(sampleData, otuData);
        });
    });

    Plotly.d3.json(`/metadata/${sample}`, function(error, metaData) {
        if (error) return console.warn(error);
        updateMetaData(metaData);
    })
};

// Checking the sample
function getOptions() {

    // Grabbing the dropdown
    var selDataset = document.getElementById('selDataset');

    // Finding the list of sample names
    Plotly.d3.json('/names', function(error, sampleNames) {
        for (var i = 0; i < sampleNames.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = sampleNames[i];
            currentOption.value = sampleNames[i]
            selDataset.appendChild(currentOption);
        }

        // Call to find the data
        getData(sampleNames[0], buildCharts);
    })
};

// Things changed - Call to update
function optionChanged(newSample) {

    // Fetch new data
    getData(newSample, updateCharts);
};

function init() {
    getOptions();
};

// Initialize the dashboard
init();