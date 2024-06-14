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
    const { taskName } = this.state;
    const { serverAPI } = this;

    const task = {
      name: taskName,
      time: 0,
      isRunning: false,
      isDone: false,
      isRemoved: false,
    };

    await serverAPI.postData(task);
    const data = await serverAPI.fetchData();
    this.setState({ tasks: data });
  }

  async componentDidMount() {
    const data = await this.serverAPI.fetchData();
    this.setState({ tasks: data });
  }

  renderTask() {
    const { tasks } = this.state;

    return tasks.map((item) => {
      if(item.isDone === true) {
        return <>{this.TaskDone(item)}</>;
      } else {
      return <>{this.Task(item)}</>;
      }
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
    const currentTask = this.state.tasks.filter((item) => item.id === id);

    const { time } = currentTask[0];
    const [seconds, minutes, hours] = this.parseTimeForDisplay(time);

    const timeDisplay = `${hours}:${minutes}:${seconds}`;

    return <>{timeDisplay}</>;
  }

  parseTimeForDisplay(timeInSeconds) {
    let seconds, minutes, hours;
    seconds = timeInSeconds;
    minutes = 0;
    hours = 0;

    if (seconds >= 60) {
      seconds %= 60;
      minutes = parseInt(timeInSeconds / 60);
    }

    if (minutes >= 60) {
      minutes %= 60;
      hours = parseInt(timeInSeconds / 60 ** 2);
    }

    [seconds, minutes, hours] = [seconds, minutes, hours].map((item) =>
      item.toString().padStart(2, "0")
    );

    return [seconds, minutes, hours];
  }

  timerStartCount(evt) {
    const targetID = evt.target.parentElement.parentElement.id;
    const { tasks } = this.state;
    const copyTasks = this.createDeepCopy(tasks.map((item) => item));
    const currentTask = copyTasks.filter((item) => item.id === targetID);

    let { time } = currentTask[0];

    time++;

    copyTasks.forEach((item) => {
      if (item.id === targetID) {
        item.time = time;
      }
    });

    this.setState({ tasks: copyTasks });
  }

  handleTaskStartPause = (evt) => {
    const taskID = evt.target.parentElement.parentElement.id;

    if (this.isTaskRunning(taskID)) {
      this.removeTimeInterval(taskID);
      const [currentTask, updatedTasks] = this.getUpdatedTaskData(taskID, {
        isRunning: false,
      });
      this.updateTaskData(taskID, currentTask, updatedTasks);
    } else {
      const intervalID = setInterval(
        this.timerStartCount.bind(this, evt),
        1000
      );

      this.intervalIDList.push({ intervalID, id: taskID });
      const [currentTask, updatedTasks] = this.getUpdatedTaskData(taskID, {
        isRunning: true,
      });
      this.updateTaskData(taskID, currentTask, updatedTasks);
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
    console.log(isRunning);
    return isRunning;
  }

  updateTaskData(taskID, currentTask, updatedTasks) {
    this.setState({ tasks: updatedTasks }, () => {
      this.serverAPI.putData(taskID, currentTask);
    });
  }

  getUpdatedTaskData(taskID, ...props) {
    const { tasks } = this.state;
    const copyTasks = this.createDeepCopy(tasks.map((item) => item));

    let currentTask = null;

    copyTasks.forEach((item) => {
      if (item.id === taskID) {
        props.forEach((ele) => {
          const key = Object.keys(ele);
          item[key] = ele[key];
        });

        currentTask = { ...item };
      }
    });

    const updatedTasks = copyTasks;

    return [currentTask, updatedTasks];
  }

  createDeepCopy(item) {
    const deepCopy = JSON.parse(JSON.stringify(item));

    return deepCopy;
  }

  handleTaskEnd = (evt) => {
    const taskID = evt.target.parentElement.parentElement.id;

    if (this.isTaskRunning(taskID)) {
      this.removeTimeInterval(taskID);
      const [currentTask, updatedTasks] = this.getUpdatedTaskData(taskID, {
        isRunning: false,
      });
      this.updateTaskData(taskID, currentTask, updatedTasks);
    }

    const [currentTask, updatedTasks] = this.getUpdatedTaskData(
      taskID,
      { isRunning: false },
      {
        isDone: true,
      }
    );
    console.log(updatedTasks);
    this.updateTaskData(taskID, currentTask, updatedTasks);
  };

  handleTaskRemove() {}

  Task(item) {
    return (
      <section id={item.id}>
        <header>
          {item.name}, {this.timerShowTime(item.id)}
        </header>
        <footer>
          <button onClick={this.handleTaskStartPause}>start/pause</button>
          <button onClick={this.handleTaskEnd}>zakończone</button>
          <button disabled="true">
            usuń
          </button>
        </footer>
      </section>
    );
  }

  TaskDone(item) {
    return (
      <section id={item.id}>
        <header>
          {item.name}, {this.timerShowTime(item.id)}
        </header>
        <footer>
          <button disabled={true}>start/pause</button>
          <button disabled={true}>zakończone</button>
          <button onClick={this.handleTaskRemove} disabled={false}>
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
}

export default TasksManager;
