import React from "react";
import { Route, Switch } from "react-router-dom";
import SignUp from "./components/SignUp";
import Activation from "./components/Activation";
import ForgetPassword from "./components/ForgetPassword";
import SignIn from "./components/SignIn";

function App() {
    return (
        <div>
            <Switch>
                <Route exact path="/" />
                <Route exact path="/signup" component={SignUp} />
                <Route exact path="/signin" component={SignIn} />
                <Route
                    exact
                    path="/users/activate/:token"
                    component={Activation}
                />
                <Route
                    exact
                    path="/users/password/forget"
                    component={ForgetPassword}
                />
            </Switch>
        </div>
    );
}

export default App;
