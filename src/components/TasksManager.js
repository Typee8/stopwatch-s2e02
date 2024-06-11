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
    this.timeIntervals = [];
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

    const isIntervalSet = this.timeIntervals.some(
      (item) => item.taskID && item.taskID === taskID
    );

    if (isIntervalSet) {
      const setTimeIntervals = this.timeIntervals.filter((item) => {
        if (item.taskID === taskID) {
          clearInterval(item.intervalID);
          
          const {tasks} = this.state;
          const selectedTask = tasks.filter(item => item.id === taskID);
          this.serverAPI.putData(taskID, selectedTask[0]);
        } else {
          return item;
        }
      });
      this.timeIntervals = setTimeIntervals;
    } else {
      const intervalID = setInterval(
        this.timerStartCount.bind(this, evt),
        1000
      );

      this.timeIntervals.push({ intervalID, taskID });
    }
  };

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

  handleTaskEnd() {}
  handleTaskDelete() {}
}

export default TasksManager;
