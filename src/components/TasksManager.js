import React from "react";
import ServerAPI from "./ServerAPI";

class TasksManager extends React.Component {
  state = {
    taskName: "",
    tasks: [],
  };

  constructor(props) {
    super(props);
    this.serverAPI = new ServerAPI();
    this.intervalIDList = [];
  }

  onClick = () => {
    const { tasks } = this.state;
  };

  putInputToState = (evt) => {
    const { name, value } = evt.target;
    this.setState({ [name]: value });
  };

  async handleTaskSubmit(evt) {
    evt.preventDefault();
    const { tasks, taskName } = this.state;
    const { serverAPI } = this;

    const task = {
      name: taskName,
      time: {
        seconds: 0,
        minutes: 0,
        hours: 0,
      },
      isRunning: false,
      isDone: false,
      isRemoved: false,
    };

    await serverAPI.postData(task);
    const data = await serverAPI.fetchData();
    this.setState({ tasks: data });
  }

  async componentDidMount() {
    const { serverAPI } = this;
    const data = await serverAPI.fetchData();
    this.setState({ tasks: data });
  }

  renderTask() {
    const { tasks } = this.state;

    return tasks.map((item) => {
      return <>{this.Task(item)}</>;
    });
  }

  TaskInput() {
    return (
      <form onSubmit={this.handleTaskSubmit.bind(this)}>
        <label htmlFor="taskName">Provide Task Name:</label>
        <input
          name="taskName"
          id="taskName"
          value={this.state.taskName}
          onChange={this.putInputToState}
        />
        <input type="submit" />
      </form>
    );
  }

  timerShowTime(id) {
    const [seconds, minutes, hours] = this.timerGetNormalizedUnits(id);
    const time = `${hours}:${minutes}:${seconds}`;

    return <>{time}</>;
  }

  timerGetNormalizedUnits(id) {
    const taskArray = this.state.tasks.filter((item) => item.id === id);
    const task = taskArray[0];

    const { seconds, minutes, hours } = task.time;

    const timer = [seconds, minutes, hours].map((item) =>
      item.toString().padStart(2, "0")
    );

    return timer;
  }

  timerStartCount(evt) {
    const targetID = evt.target.parentElement.parentElement.id;
    const { tasks } = this.state;
    const copyTasks = tasks.map((item) => item);
    const targetTask = copyTasks.filter((item) => item.id === targetID);

    let { seconds, minutes, hours } = targetTask[0].time;
    seconds++;

    if (seconds >= 60) {
      minutes++;
      seconds = 0;
    }
    if (minutes >= 60) {
      hours++;
      minutes = 0;
    }

    copyTasks.forEach((item) => {
      if (item.id === targetID) {
        item.time = { seconds, minutes, hours };
      }
    });

    this.setState({ tasks: copyTasks });
  }

  handleTaskStartPause = (evt) => {
    const taskID = evt.target.parentElement.parentElement.id;

    if (this.isTaskRunning(taskID)) {
      this.removeTimeInterval(taskID);
      const updatedTasks = this.configTaskData(taskID, {isRunning: false});
      this.updateTaskData(taskID, updatedTasks);
    } else {
      const intervalID = setInterval(
        this.timerStartCount.bind(this, evt),
        1000
      );

      this.intervalIDList.push({ intervalID, id: taskID });
      const updatedTasks = this.configTaskData(taskID, { isRunning: true });
      this.updateTaskData(taskID, updatedTasks);
    }
  };

  removeTimeInterval(taskID) {
    const { intervalIDList } = this;
    const [intervalID] = intervalIDList
      .filter((item) => item.id === taskID)
      .map((item) => item.intervalID);
    const indexOfIntervalID = intervalIDList.map((item) => {
      if (item.id === taskID) {
        const index = intervalIDList.indexOf(item);
        return index;
      }
    });

    clearInterval(intervalID);
    intervalIDList.splice(indexOfIntervalID, 1);
  }

  isTaskRunning(taskID) {
    const { tasks } = this.state;
    const [isRunning] = tasks
      .filter((item) => item.id === taskID)
      .map((item) => item.isRunning);
    return isRunning;
  }

  updateTaskData(taskID, array) {
    const { tasks } = this.state;
    this.setState({ tasks: array });
    const selectedTask = tasks.filter((item) => item.id === taskID);
    this.serverAPI.putData(taskID, selectedTask[0]);
  }

  configTaskData(taskID, ...props) {
    const { tasks } = this.state;
    const copyTasks = tasks.map((item) => item);

    copyTasks.forEach((item) => {
      if (item.id === taskID) {
        props.forEach(ele => {
          const key = Object.keys(ele);
          item[key] = ele[key];
        })
      }
    });

    const updatedTasks = copyTasks;

    return updatedTasks;
  }

  handleTaskEnd(evt) {
    const taskID = evt.target.parentElement.parentElement.id;

    if (this.isTaskRunning(taskID)) {
      this.removeTimeInterval(taskID);
      const updatedTasks = this.configTaskData(taskID, {isRunning: false});
      this.updateTaskData(taskID, updatedTasks);
    }

    
  }

  Task(item) {
    return (
      <section id={item.id}>
        <header>
          {item.name}, {this.timerShowTime(item.id)}
        </header>
        <footer>
          <button onClick={this.handleTaskStartPause}>start/pause</button>
          <button onClick={this.handleTaskEnd}>zakończone</button>
          <button onClick={this.handleTaskDelete} disabled="true">
            usuń
          </button>
        </footer>
      </section>
    );
  }

  render() {
    const { tasks } = this.state;

    if (tasks.length > 0) {
      return (
        <>
          {this.TaskInput()}
          <section>{this.renderTask()}</section>
        </>
      );
    } else {
      return <>{this.TaskInput()}</>;
    }
  }

  handleTaskDelete() {}
}

export default TasksManager;
