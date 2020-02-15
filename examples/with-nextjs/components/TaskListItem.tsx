import { FunctionComponent, useCallback } from "react"
import { Task } from "../lib/task"

type Props = Readonly<{
  task: Task;
  onDelete: (task: Task) => void;
}>

export const TaskListItem: FunctionComponent<Props> = ({ task, onDelete }) => {
  const onClick = useCallback(() => onDelete(task), [ onDelete, task ])
  return (
    <li>
      {task.name} <button onClick={onClick}>✔</button>
    </li>
  )
}