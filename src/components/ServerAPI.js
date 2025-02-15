class ServerAPI {
  constructor() {
    this.url = "http://192.168.1.103:3005/data";
  }

  async postData(obj) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    };

    const response = await fetch(this.url, options);

    if (response.ok) {
      console.log("POST - successful");
    } else {
      throw new Error(`POST - failed, status: ${response.status}`);
    }
  }

  async fetchData() {
    const response = await fetch(this.url);

    if (response.ok) {
      console.log("FETCH - successful");
      let result = await response.json();
      result = this.eachIDtoString(result);
      return result;
    } else {
      throw new Error(`FETCH - failed, status: ${response.status}`);
    }
  }

  async putData(id, obj) {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    };
    console.log(options.body);

    const response = await fetch(`${this.url}/${id}`, options);

    if (response.ok) {
      console.log("PUT - successful");
    } else {
      throw new Error(`PUT - failed, status: ${response.status}`);
    }
  }

  async deleteData(id) {
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`${this.url}/${id}`, options);

    if (response.ok) {
      console.log("DELETE - successful");
    } else {
      throw new Error(`DELETE - failed, status: ${response.status}`);
    }
  }

  eachIDtoString(response) {
    const processedResponse = response.map((item) => {
      if (item.id) {
        item.id = item.id.toString();
        return item;
      }
    });

    return processedResponse;
  }
}

export default ServerAPI;
