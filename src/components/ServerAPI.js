class ServerAPI {
  constructor() {
    this.url = "http://localhost:3005/data";
  }

  async postData (obj) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj)
    };

    const response = await fetch(this.url, options);

    if(response.ok) {
      console.log("POST - successful");
    } else {
      throw new Error (`POST - failed, status: ${response.status}`);
    }
  }

  async fetchData () {
    const response = await fetch(this.url);

    if(response.ok) {
      console.log('FETCH - successful')
      return response.json();
    } else {
      throw new Error (`FETCH - failed, status: ${response.status}`)
    }
  }
}

export default ServerAPI;