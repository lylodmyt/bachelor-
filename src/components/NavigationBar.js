import React, { Component } from "react";
import {Link, Navigate, Outlet} from "react-router-dom";
import AuthService from "../services/auth-service";
import { routeHelper } from "../helpers/routeHelper";

class NavigationBar extends Component {
    state = {
        currentUser: AuthService.getCurrentUser(),
    };

    handleLogout = () => {
        AuthService.logout(() => {
            this.props.router.navigate("/");
            window.location.reload();
        });
    };

    render() {
        const { currentUser } = this.state;
        const isAdmin = currentUser.roles[0] === "ADMIN";

        if (!currentUser) {
            return <Navigate to="/" />;
        }
        return (
            <div>
                <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow">
                    <h5 className="my-0 mr-md-auto font-weight-normal">TestQuiz</h5>
                    <nav className="my-2 my-md-0 mr-md-3">
                        <Link className="p-2 text-dark" to="">
                            Home
                        </Link>
                        <Link className="p-2 text-dark" to="topics">
                            My topics
                        </Link>
                        <Link className="p-2 text-dark" to="tests">
                            My tests
                        </Link>
                        <Link className="p-2 text-dark" to="public">
                            Public tests
                        </Link>
                        {isAdmin && <Link className="p-2 text-dark" to="reports">Reports</Link>}
                    </nav>
                    <button className="btn btn-outline-danger" onClick={this.handleLogout}>
                        Logout
                    </button>
                </div>
                <Outlet />
            </div>
        );
    }
}
export default routeHelper(NavigationBar);
