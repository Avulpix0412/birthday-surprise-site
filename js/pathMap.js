export function computePathPositions(count, width, height) {
  if (count <= 1) {
    return [{ x: width / 2, y: height / 2 }];
  }
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = t * width;
    const y = height / 2 + Math.sin(t * Math.PI * 2) * (height / 2 - 4);
    points.push({ x, y });
  }
  return points;
}
