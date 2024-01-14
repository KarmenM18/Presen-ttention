document.addEventListener('DOMContentLoaded', function () {
    // IGNORE THIS ---- ONLY A PLACE HOLDER
    var slideLabels = ['Slide 1', 'Slide 2', 'Slide 3'];
    var averageAttentionData = [0, 0.60, 0];
    var maxAttentionData = [0, 0, 0];

    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: slideLabels,
            datasets: [
                {
                    label: 'Average Attention',
                    data: averageAttentionData,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Max Attention',
                    data: maxAttentionData,
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Update statistics
    function updateStatistics(slideNumber, averageAttention, maxAttention) {
        // Update chart
        myChart.data.datasets[0].data[slideNumber - 1] = averageAttention;
        myChart.data.datasets[1].data[slideNumber - 1] = maxAttention;
        myChart.update();
    }

    // Simulate updates (replace with actual data)
    setInterval(function () {
        var slideNumber = Math.floor(Math.random() * slideLabels.length) + 1;
        var averageAttention = Math.floor(Math.random() * 51) + 25; // Random average attention percentage (25-75)
        var maxAttention = Math.floor(Math.random() * 26) + 75; // Random max attention percentage (75-100)

        updateStatistics(slideNumber, averageAttention, maxAttention);
    }, 5000); // Update every 5 seconds (adjust as needed)
});
