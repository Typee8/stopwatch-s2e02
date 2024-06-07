import React from "react";
import ServerAPI from "./ServerAPI";

class TasksManager extends React.Component {
  state = {
    taskName: "",
    tasks: [],
    timer: {
      seconds: 0,
      minutes: 0,
      hours: 0,
    },
  };

  constructor(props) {
    super(props);
    this.serverAPI = new ServerAPI();
  }

  onClick = () => {
    const { tasks } = this.state;
    console.log(tasks);
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
      time: "00:00:00",
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

  timerShowTime() {
    const [seconds, minutes, hours] = this.timerGetNormalizedUnits();
    const time = `${hours}:${minutes}:${seconds}`;
    
    return <>{time}</>;
  }

  timerGetNormalizedUnits() {
    const { seconds, minutes, hours } = this.state.timer;
    const timer = [seconds, minutes, hours].map((item) =>
      item.toString().padStart(2, "0")
    );

    return timer;
  }

  timerStartCount() {
    let { seconds, minutes, hours } = this.state.timer;
    seconds++;

    if (seconds >= 60) {
      minutes++;
      seconds = 0;
    }
    if (minutes >= 60) {
      hours++;
      minutes = 0;
    }

    const timer = { seconds, minutes, hours };
    this.setState({timer});
  }

  handleTaskStartPause = (evt) => {
    const intervalID = setInterval(this.timerStartCount.bind(this), 1000);
  };

  Task(item) {
    return (
      <section id={item.id}>
        <header>
          {item.name}, {this.timerShowTime()}
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
