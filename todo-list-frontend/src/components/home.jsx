import React, { useEffect, useState } from "react";
import Create from "./createTask";
import axios from "axios";
import {
  BsFillCheckCircleFill,
  BsCircleFill,
  BsFillTrashFill,
} from "react-icons/bs";

function home() {
  const [todos, setTodos] = useState([]);
  const [showLoginForm, setShowLoginForm] = useState(false); // To toggle login form
  const [showSignupForm, setShowSignupForm] = useState(false); // To toggle signup form
  const [username, setUsername] = useState(""); // For login/signup form
  const [password, setPassword] = useState(""); // For login/signup form
  const [loggedIn, setLoggedIn] = useState(false); // Track if user is logged in
  const [authToken, setAuthToken] = useState(null); // Store JWT token
  useEffect(() => {
    const fetchTodos = () => {
      axios
        .get("http://localhost:5000/get")
        .then((result) => setTodos(result.data))
        .catch((err) => console.log(err));
    };

    // Fetch the todos initially
    fetchTodos();

    const intervalId = setInterval(fetchTodos, 1000);

    return () => clearInterval(intervalId);
  }, []);
  const handleEdit = (id) => {
    axios
      .put(
        "http://localhost:5000/update/" + id,
        { done: true },
        {
          headers: { Authorization: `Bearer ${authToken}` }, // Include token
        }
      )
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  };
  const handleDelete = (id) => {
    axios
      .delete("http://localhost:5000/delete/" + id, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
  };
  const handleLogin = () => {
    console.log("Attempting login with:", { username, password });

    axios
      .post("http://localhost:5000/login", { username, password })
      .then((result) => {
        console.log("Login successful:", result.data);
        setLoggedIn(true);
        setAuthToken(result.data.accessToken); // Store token
        console.log(authToken);
        console.log(result.data.accessToken);
        setShowLoginForm(false); // Hide login form
      })
      .catch((err) => {
        console.error(
          "Login error:",
          err.response ? err.response.data : err.message
        );
      });
  };
  const handleSignup = () => {
    axios
      .post("http://localhost:5000/register", { username, password })
      .then((result) => {
        console.log("Signup successful:", result.data);
        setShowSignupForm(false); // Hide signup form
      })
      .catch((err) => console.log(err));
  };
  return (
    <div>
      <h2>Todo list</h2>
      <Create authToken={authToken} />
      {todos.length === 0 ? (
        <div>
          <h2>no record</h2>
        </div>
      ) : (
        todos.map((todo) => (
          <div>
            <div onClick={() => handleEdit(todo._id)}>
              {todo.done ? (
                <BsFillCheckCircleFill className="icon" />
              ) : (
                <BsCircleFill />
              )}
              <p>{todo.task}</p>
            </div>
            <div>
              <span>
                <BsFillTrashFill
                  className="icon"
                  onClick={() => handleDelete(todo._id)}
                />
              </span>
            </div>
          </div>
        ))
      )}
      {/* Login/Signup Toggle */}
      {!loggedIn && (
        <div>
          <button onClick={() => setShowLoginForm(!showLoginForm)}>
            {showLoginForm ? "Cancel Login" : "Login"}
          </button>
          <button onClick={() => setShowSignupForm(!showSignupForm)}>
            {showSignupForm ? "Cancel Signup" : "Sign Up"}
          </button>
        </div>
      )}

      {/* Login Form */}
      {showLoginForm && (
        <div>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* Signup Form */}
      {showSignupForm && (
        <div>
          <h2>Sign Up</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSignup}>Sign Up</button>
        </div>
      )}

      {/* Logout */}
      {loggedIn && (
        <div>
          <button
            onClick={() => {
              setLoggedIn(false);
              setAuthToken(null);
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default home;
