import React from "react";
import ServerAPI from "./ServerAPI";

function importAllSVG() {
  const r = require.context("../styles/svg-icons", false, /\.svg$/);

  const svgList = {};
  r.keys().forEach((key) => {
    r;
    const svgName = key.replace("./", "").replace(".svg", "");

    svgList[svgName] = r(key).default;
  });
  return svgList;
}
const svgList = importAllSVG();

class TasksManager extends React.Component {
  state = {
    tasks: [],
    taskName: {
      default: "New Task",
      input: "",
    },
    isTaskFormShown: false,
  };

  constructor(props) {
    super(props);
    this.serverAPI = new ServerAPI();
    this.intervalIDList = [];
  }

  putInputToState = (evt) => {
    const { taskName } = this.state;
    const taskNameCopy = this.createDeepCopy(taskName);
    const { value } = evt.target;
    taskNameCopy.input = value;
    console.log(taskNameCopy);
    this.setState({ taskName: taskNameCopy });
  };

  async handleTaskSubmit(evt) {
    evt.preventDefault();
    const { taskName } = this.state;
    const { serverAPI } = this;

    const task = {
      name: taskName.input,
      time: 0,
      isRunning: false,
      isDone: false,
      isRemoved: false,
    };

    await serverAPI.postData(task);
    const data = await serverAPI.fetchData();
    this.setState({ tasks: data });
    this.resetTaskForm();
  }

  async componentDidMount() {
    const data = await this.serverAPI.fetchData();
    this.setState({ tasks: data });
  }

  renderTask() {
    const { tasks } = this.state;

    return tasks.map((item) => {
      if (item.isRemoved === true) {
        return;
      }

      return <>{this.TaskTemplate(item)}</>;
    });
  }

  resetTaskForm() {
    const { taskName } = this.state;
    const taskNameCopy = this.createDeepCopy(taskName);
    taskNameCopy.input = "";
    this.setState({ isTaskFormShown: false, taskName: taskNameCopy });
  }

  displayTaskForm() {
    this.setState({ isTaskFormShown: true });
  }

  inputTaskFormValue = (evt) => {
    const { input } = this.state.taskName;
    evt.target.value = input;
  };

  defaultTaskFormValue = (evt) => {
    console.log(this.state.taskName);
    if (evt) {
      const { taskName } = this.state;
      if (taskName.input.length === 0) {
        evt.target.value = taskName.default;
      }
      return;
    }

    const { taskName } = this.state;
    const taskFormInput = document.querySelector(".taskForm__input");

    if (document.activeElement !== taskFormInput) {
      return taskName.default;
    }
  };

  NewTask() {
    const { isTaskFormShown } = this.state;
    let content;

    if (isTaskFormShown) {
      content = <>{this.TaskForm()}</>;
    } else {
      content = <>{this.BtnAdd()}</>;
    }

    return <section className="newTask">{content}</section>;
  }

  TaskForm() {
    return (
      <form className="taskForm" onSubmit={this.handleTaskSubmit.bind(this)}>
        {this.BtnFormRemove()}
        <textarea
          className="taskForm__input"
          name="taskName"
          id="taskName"
          value={this.defaultTaskFormValue()}
          onFocus={this.inputTaskFormValue}
          onBlur={(evt) => this.defaultTaskFormValue(evt)}
          onChange={this.putInputToState}
          maxLength="33"
        />
        <input className="btn btn--submit" type="submit" />
      </form>
    );
  }

  timerShowTime(id) {
    const currentTask = this.state.tasks.filter((item) => item.id === id);

    const { time } = currentTask[0];
    const [seconds, minutes, hours] = this.parseTimeForDisplay(time);

    let timeDisplay;

    if (hours > 0) {
      timeDisplay = `${hours}:${minutes}:${seconds}`;
    } else {
      timeDisplay = `${minutes}:${seconds}`;
    }

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

  timerStartCount(taskID) {
    const { tasks } = this.state;
    const copyTasks = this.createDeepCopy(tasks.map((item) => item));
    const currentTask = copyTasks.filter((item) => item.id === taskID);

    let { time } = currentTask[0];

    time++;

    copyTasks.forEach((item) => {
      if (item.id === taskID) {
        item.time = time;
      }
    });
    this.setState({ tasks: copyTasks });
  }

  handleTaskStartPause = (evt) => {
    console.log(evt.currentTarget);
    const taskID = evt.currentTarget.parentElement.parentElement.id;

    if (this.isTaskRunning(taskID)) {
      this.removeTimeInterval(taskID);
      const [currentTask, updatedTasks] = this.getUpdatedTaskData(taskID, {
        isRunning: false,
      });
      this.updateTaskData(taskID, currentTask, updatedTasks);
    } else {
      const intervalID = setInterval(
        this.timerStartCount.bind(this, taskID),
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
    const taskID = evt.currentTarget.parentElement.parentElement.id;

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
    this.updateTaskData(taskID, currentTask, updatedTasks);
  };

  handleTaskRemove = (evt) => {
    const taskID = evt.currentTarget.parentElement.id;
    if (this.isTaskRunning(taskID)) {
      this.removeTimeInterval(taskID);
    }

    const [currentTask, updatedTasks] = this.getUpdatedTaskData(
      taskID,
      {
        isRunning: false,
      },
      { isDone: true },
      { isRemoved: true }
    );
    this.updateTaskData(taskID, currentTask, updatedTasks);
  };

  startPauseButton(isRunning) {
    if (isRunning) {
      return (
        <button className="btn btn--pause" onClick={this.handleTaskStartPause}>
          <img className="btn__icon" src={svgList.equals_icon} />
        </button>
      );
    }
    return (
      <button className="btn btn--start" onClick={this.handleTaskStartPause}>
        <img className="btn__icon" src={svgList.greaterThan_icon} />
      </button>
    );
  }

  BtnFormRemove() {
    return (
      <button className="btn btn--remove" onClick={() => this.resetTaskForm()}>
        <img className="btn__icon btn__icon--small" src={svgList.cross_icon} />
      </button>
    );
  }

  BtnAdd() {
    return (
      <button
        className="btn btn--add"
        onClick={() => this.displayTaskForm()}
        disabled={false}
      >
        <img className="btn__icon" src={svgList.plus_icon} />
      </button>
    );
  }

  BtnRemove() {
    return (
      <button
        className="btn btn--remove"
        onClick={this.handleTaskRemove}
        disabled={false}
      >
        <img className="btn__icon btn__icon--small" src={svgList.cross_icon} />
      </button>
    );
  }

  BtnStart() {
    return (
      <button className="btn btn--start" onClick={this.handleTaskStartPause}>
        <img className="btn__icon" src={svgList.greaterThan_icon} />
      </button>
    );
  }

  BtnPause() {
    return (
      <button className="btn btn--pause" onClick={this.handleTaskStartPause}>
        <img className="btn__icon" src={svgList.equals_icon} />
      </button>
    );
  }

  BtnEnd() {
    return (
      <button className="btn btn--end" onClick={this.handleTaskEnd}>
        <img className="btn__icon btn__icon--small" src={svgList.square_icon} />
      </button>
    );
  }

  manageBtns(item) {
    if (item.isRemoved) {
      return;
    }

    if (item.time === 0) {
      return <>{this.BtnStart()}</>;
    }

    if (item.isRunning) {
      return <>{this.BtnPause()}</>;
    }

    return (
      <>
        {this.BtnEnd()}
        {this.BtnStart()}
      </>
    );
  }

  TaskFooter(item) {
    return <footer className="task__footer">{this.manageBtns(item)}</footer>;
  }

  TaskHeader(item) {
    return (
      <header className="task__header">
        <div className="task__name">{item.name}</div>
        <div className="task__timer">{this.timerShowTime(item.id)}</div>
      </header>
    );
  }

  TaskTemplate(item) {
    return (
      <section id={item.id} className="task">
        {this.BtnRemove()}
        {this.TaskHeader(item)}
        {this.TaskFooter(item)}
      </section>
    );
  }

  render() {
    const { tasks } = this.state;

    if (tasks.length > 0) {
      return (
        <>
          <section>{this.renderTask()}</section>
          {this.NewTask()}
        </>
      );
    } else {
      return <>{this.NewTask()}</>;
    }
  }
}

export default TasksManager;
