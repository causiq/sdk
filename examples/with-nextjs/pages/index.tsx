import { useState } from "react"
import { Task } from "../lib/task"
import { TaskForm } from "../components/TaskForm"
import { TaskList } from "../components/TaskList"
import { CompletedTaskList } from "../components/CompletedTaskList"
import Layout from '../components/Layout'

function getData(url) {
  return new Promise(async (resolve, reject) => {
    const req = new XMLHttpRequest()
    req.open('GET', url, true)
    req.setRequestHeader('Content-Type', 'application/json')
    req.setRequestHeader('Accept', 'application/json')
    req.send()
    req.onload = resolve
    req.onerror = reject
  })
}

async function sendReqs(_: any, navigate: boolean = false) {
  if (navigate) {
    history.pushState({ test: 'testing' }, '', `${location.pathname}`);
    history.pushState({ test: 'testing' }, '', `${location.pathname}#foo=bar1`);
  }

  const data1 = await getData('https://httpbin.org/get?a=1')
  console.log('data downloaded 1')

  const datas = await Promise.all([
    getData('https://httpbin.org/get?a=2'),
    getData('https://httpbin.org/get?a=3')
  ])

  console.log('downloaded all the datas', data1, datas)
}

function App() {
  const [isCompletedListActive, setCompletedListActive] = useState(false)

  const [newTask, setNewTask] = useState({
    id: 1,
    name: "",
    completed: false
  })

  const [tasks, setTasks] = useState(new Array<Task>())
  const [completedTasks, setCompletedTasks] = useState(new Array<Task>())

  const addTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setNewTask({
      id: newTask.id + 1,
      name: "",
      completed: false
    })
    setTasks([...tasks, newTask])
  }

  const handleTaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTask({
      ...newTask,
      name: event.target.value
    })
  }

  const deleteTask = (taskToDelete: Task) => {
    setTasks([...tasks.filter(task => task.id !== taskToDelete.id)])
    setCompletedTasks([...completedTasks, taskToDelete])
  }

  const undoTask = (taskToUndo: Task) => {
    setCompletedTasks([
      ...completedTasks.filter(task => task.id !== taskToUndo.id)
    ])
    setTasks([...tasks, taskToUndo])
  }

  const completeListActiveElement = (
    <>
      <input
        onChange={() => setCompletedListActive(!isCompletedListActive)}
        type="checkbox"
        defaultValue={isCompletedListActive.toString()}
        id="completedListActive"
      />
      <label htmlFor="completedListActive">Show Done Tasks</label>
    </>
  )

  return (
    <Layout>
      <h1>TS next Todos ✔</h1>

      <TaskForm
        disabled={newTask.name.length == 0}
        task={newTask}
        onAdd={addTask}
        onChange={handleTaskChange} />

      {completeListActiveElement}

      <div className="lists">
        <TaskList tasks={tasks} onDelete={deleteTask} />
        {isCompletedListActive
          ? <CompletedTaskList tasks={completedTasks} onDelete={undoTask} />
          : null}
      </div>

      <button onClick={sendReqs}>
        Test XHR Req
      </button>

      <style jsx>{`
        .lists {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </Layout>
  )
}

export default App