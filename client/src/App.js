import React from "react";
import { Route, Switch } from "react-router-dom";
import SignUp from "./components/SignUp";
import { Activation } from "./components/Activation";

function App() {
    return (
        <div>
            <Switch>
                <Route exact path="/" />
                <Route exact path="/signup" component={SignUp} />
                <Route
                    exact
                    path="/users/activate/:token"
                    component={Activation}
                />
            </Switch>
        </div>
    );
}

export default App;
