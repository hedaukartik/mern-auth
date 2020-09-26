import React from "react";
import { Route, Switch } from "react-router-dom";
import SignUp from "./components/SignUp";

function App() {
    return (
        <div>
            <Switch>
                <Route exact path="/" />
                <Route path="/signup" component={SignUp} />
            </Switch>
        </div>
    );
}

export default App;
