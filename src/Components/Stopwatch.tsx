import { useStopwatch } from "react-timer-hook";
import { api } from "~/utils/api";

type props = {
  offset: number;
};

export default function MyStopwatch({ offset }: props) {
  const updateTime = api.task.updateTime.useMutation();

  const stopwatchOffset = new Date();
  stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + offset);
  const { seconds, minutes, hours, days, isRunning, start, pause, reset } =
    useStopwatch({ autoStart: true, offsetTimestamp: stopwatchOffset });

  return (
    <div>
      <span>{hours.toString().padStart(2, "0")}</span>:
      <span>{minutes.toString().padStart(2, "0")}</span>:
      <span>{seconds.toString().padStart(2, "0")}</span>
    </div>
  );
}
