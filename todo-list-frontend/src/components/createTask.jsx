import React, { useState } from "react";
import axios from "axios";

function createTask({ authToken }) {
  const [task, setTask] = useState();
  const handleAdd = () => {
    axios
      .post(
        "http://localhost:5000/add",
        { task: task },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      )
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter Task"
        onChange={(e) => setTask(e.target.value)}
      />
      <button type="button" onClick={handleAdd}>
        add
      </button>
    </div>
  );
}

export default createTask;
