import { FunctionComponent, useCallback } from "react"
import { Task } from "../lib/task"

type Props = Readonly<{
  task: Task;
  onDelete: (task: Task) => void;
}>

export const CompletedTaskListItem: FunctionComponent<Props> = ({ task, onDelete }) => {
  const onClick = useCallback(() => onDelete(task), [ onDelete, task ])

  return (
    <>
      <li>
        <span className="strike">{task.name}&nbsp;</span>
        <button onClick={onClick}>X</button>
      </li>
      <style jsx>{`
        span {
          color: green;
          text-decoration: line-through;
        }
      `}</style>
    </>
  );
};
