import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import App from './views/App'
const Router = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path='/' component={App} />
            </Switch>
        </BrowserRouter>
    )
}

export default Router
