import { FunctionComponent } from "react"
import { Task } from "../lib/task"
import { CompletedTaskListItem } from "./CompletedTaskListItem"

type Props = Readonly<{
  tasks: Task[];
  onDelete: (task: Task) => void;
}>

export const CompletedTaskList: FunctionComponent<Props> = ({ tasks, onDelete }) => (
  <>
    <div>
      <h3>Done</h3>
      {tasks.length == 0 ? "-" : null}
      <ul>
        {tasks.map((task, _i) => (
          <CompletedTaskListItem key={_i} task={task} onDelete={onDelete} />
        ))}
      </ul>
    </div>
    <style jsx>{`
      div {
        min-width: 12em;
      }
    `}</style>
  </>
)