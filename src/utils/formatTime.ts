export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const hourString = hours.toString().padStart(2, "0");
  const minuteString = minutes.toString().padStart(2, "0");
  const secondString = remainingSeconds.toString().padStart(2, "0");

  return `${hourString}:${minuteString}:${secondString}`;
}
