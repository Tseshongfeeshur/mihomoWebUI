window.pageName = '概览';

{
    const ctx = document.getElementById('speed-chart').getContext('2d');
    const speedTextUpload = document.getElementById('speed-text-upload');
    const speedTextDownload = document.getElementById('speed-text-download');
    // 获取目标元素
    const speedChart = new Chart(ctx, {
    // 初始化图表
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    borderColor: '#a6c8ffc0',
                    backgroundColor: '#a6c8ff20',
                    data: [],
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                },
                {
                    borderColor: '#205fa6c0',
                    backgroundColor: '#205fa620',
                    data: [],
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                },
            ],
        },
        options: {
            animation: {
                duration: 1200,
                easing: 'easeOutQuart',
            },
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
            responsive: true,
            // 启用响应式
            maintainAspectRatio: false,
            // 禁用宽高比限制
            scales: {
                x: {
                    display: false,
                    grid: {
                        display: false,
                    },
                },
                y: {
                    // title: {
                    //     display: false,
                    // },
                    // ticks: {
                    //     callback: (value) => value.toFixed(2),
                    //     // 显示两位小数
                    // },
                    display: false,
                    // 不显示数值似乎更好看
                    beginAtZero: true,
                    grid: {
                        display: false,
                    },
                },
            },
        }
    });

    async function streamTrafficData() {
    // 从 /traffic 拿到数据并更新图表
        const response = await fetch(`http://127.0.0.1:${port}/traffic`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value);
            // 解码
            const lines = buffer.split('\n');
            buffer = lines.pop();
            // 按行分割
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const { up, down } = JSON.parse(line);
                        updateChart(up / 1024, down / 1024);
                        // kbps 转换为 Mbps
                    } catch (e) {
                        toast(`JSON 解析错误：${e}`);
                    }
                }
            }
        }
    }

    function updateChart(upload, download) {
    // 更新图表
        const currentTime = new Date().toLocaleTimeString();
        if (speedChart.data.labels.length >= 10) {
            speedChart.data.labels.shift();
            speedChart.data.datasets[0].data.shift();
            speedChart.data.datasets[1].data.shift();
        }
        // 限制最多显示 10 个数据点
        speedChart.data.labels.push(currentTime);
        speedChart.data.datasets[0].data.push(upload);
        speedChart.data.datasets[1].data.push(download);
        // 添加新数据点
        speedChart.update();
        // 更新图表
        speedTextUpload.innerText = upload.toFixed(2);
        speedTextDownload.innerText = download.toFixed(2);
        // 更新文本说明
    }
    streamTrafficData().catch(err => toast(`流数据处理失败：${err}`));
    // 启动流数据处理
}