const m = require('movuino.js');

var ax;
var ay;
var az;

m.once('movuino', movuino => {
  console.log('movuino', movuino.id)

  movuino.on('error', err => {
    console.error(err)
  })

  const accelerometer = createGraph("accelerometer");
  const gyroscope = createGraph("gyroscope");
  const magnetometer = createGraph("magnetometer");

  movuino.on('data', (data) => {
    updateGraph(accelerometer, data[0], data[1], data[2])
    updateGraph(gyroscope, data[3], data[4], data[5])
    updateGraph(magnetometer, data[6], data[7], data[8])
  })
})

function createGraph(sensor) {
  const smoothie = new SmoothieChart({
    grid: {
      fillStyle: 'transparent',
      strokeStyle: 'transparent',
      borderVisible: false
    },
    millisPerPixel: 3,
    maxValue: 1,
    minValue: -1,
    responsive: true
  });

  const canvas = document.querySelector('.'+sensor);

  smoothie.streamTo(canvas);

  const xline = new TimeSeries();
  const yline = new TimeSeries();
  const zline = new TimeSeries();

  smoothie.addTimeSeries(xline, {lineWidth:2.2,strokeStyle:'rgba(255,0,0,1)'});
  smoothie.addTimeSeries(yline, {lineWidth:2.2,strokeStyle:'rgba(0,255,0,1)'});
  smoothie.addTimeSeries(zline, {lineWidth:2.2,strokeStyle:'rgba(0,0,255,1)'});

  return smoothie;
}

function updateGraph(graph, x, y, z) {
  const [xTimeSeries, yTimeSeries, zTimeSeries] = graph.seriesSet;
  xTimeSeries.timeSeries.append(new Date().getTime(), x);
  yTimeSeries.timeSeries.append(new Date().getTime(), y);
  zTimeSeries.timeSeries.append(new Date().getTime(), z);
}
