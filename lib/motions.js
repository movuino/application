'use strict'

function isSaturated(...values) {
  return values.some(value => {
    return value === 1 || value === -1;
  });
}

function isMoving(...values) {
  return isSaturated(...values);
}

function isSleeping(...values) {
  return !isSaturated(...values);
}

function isAccelerometerSatured(values) {
  return isSaturated(values[0], values[1], values[2]);
}

function isGyroscopeSatured(values) {
  return isSaturated(values[3], values[4], values[5]);
}

function isMagnetometerSatured(values) {
  return isSaturated(values[6], values[7], values[8]);
}

module.exports.isSaturated = isSaturated
module.exports.isAccelerometerSatured = isAccelerometerSatured
module.exports.isGyroscopeSatured = isAccelerometerSatured
module.exports.isMagnetometerSatured = isMagnetometerSatured