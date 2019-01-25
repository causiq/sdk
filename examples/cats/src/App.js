import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Logary, { build, send, getLogger, Targets, Message } from 'logary'
// Supply this for your own user
const user = { id: 'abc', name: 'A B', email: 'a.b@example.com' }

// ALTERNATIVELY: You can have one of these globally per application.
const filter = next => req => next(req); // No infrastructure/non-functional requirements on requests

// A CUSTOM TARGET (uncomment send, filter, above):
const target = Targets.logaryService({
  path: 'http://localhost:10001/i/logary',
  //send: send(), // OR:
  send: filter(send())
})

// This instance is configured for the example user:
// You can have one of these prepared when the user logs in, in the user state store.
const logary = Logary(user, target, "Cats");

class App extends Component {

  render() {
    // With 'build' we get a "live" function that can send to a target/server, use it to log
    // You can have one of these in each of your module "screens"/parents
    const sendMessage = build(logary, getLogger(logary, "App"))
    sendMessage(Message.event("App started")).subscribe()

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
