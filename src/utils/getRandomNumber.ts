export function getRandomNumber(minimum: number, maximum: number) {
  return Math.random() * (maximum - minimum) +  minimum;
}
