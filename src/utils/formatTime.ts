export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const hourString = hours.toString().padStart(2, "0");
  const minuteString = minutes.toString().padStart(2, "0");
  const secondString = remainingSeconds.toString().padStart(2, "0");

  return `${hourString}:${minuteString}:${secondString}`;
}

export function formatTime2(seconds: number | null | undefined): string[] {
  if (!seconds) {
    return ["0", "0", "0"];
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const hoursString = hours.toString();
  const minutesString = minutes.toString();
  const secondsString = remainingSeconds.toString();

  return [hoursString, minutesString, secondsString];
}

export function parseTime(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  const totalSeconds =
    (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
  return totalSeconds;
}
