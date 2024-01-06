import React, { Component } from "react";
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import CheckButton from "react-validation/build/button";
import AuthService from "../services/auth-service";
import { routeHelper } from "../helpers/routeHelper";
import Alert from "react-bootstrap/Alert";
import { Card, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const required = (val) => {
    if (!val) {
        return (
            <Alert className="alert-danger">
                This field is required
            </Alert>
        );
    }
};

class Login extends Component {
    state = {
        username: '',
        password: '',
        loading: false,
        message: '',
    };

    onChangeUsername = (e) => {
        this.setState({ username: e.target.value });
    };

    onChangePassword = (e) => {
        this.setState({ password: e.target.value });
    };

    handleLogin = (e) => {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            AuthService.login(this.state.username, this.state.password)
                .then(() => {
                    this.props.router.navigate("/profile");
                    window.location.reload();
                })
                .catch((error) => {
                    const responseMessage = (error.response && error.response.data && error.response.data.message)
                        || error.message
                        || error.toString();

                    this.setState({
                        loading: false,
                        message: responseMessage
                    });
                });
        } else {
            this.setState({
                loading: false
            });
        }
    };

    render() {
        const { username, password, message } = this.state;

        return (
            <Container>
                <section className="jumbotron jumbotron-fluid text-center">
                    <div className="container">
                        <h1 className="jumbotron-heading">TestQuiz</h1>
                        <p className="lead text-muted">Application for creating and running your tests.</p>
                    </div>
                </section>
                <Card className="mb-5">
                    <Card.Header className="text-center">
                        <h3>Login</h3>
                    </Card.Header>
                    <Card.Body>
                        <Form className="container" onSubmit={this.handleLogin} ref={(c) => { this.form = c; }}>
                            {message && (
                                <div className="form-group">
                                    <div className="alert alert-danger" role="alert">
                                        {message}
                                    </div>
                                </div>
                            )}
                            <div className="form-group">
                                <Input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={this.onChangeUsername}
                                    validations={[required]}
                                    className="form-control mb-2"
                                    placeholder="Username"
                                />
                            </div>
                            <div className="form-group">
                                <Input
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={this.onChangePassword}
                                    validations={[required]}
                                    className="form-control mb-2"
                                    placeholder="Password"
                                />
                            </div>
                            <div className="form-group text-center">
                                <button className="btn btn-primary">Login</button>
                                <CheckButton
                                    style={{ display: "none" }}
                                    ref={(c) => { this.checkBtn = c; }}
                                />
                            </div>
                        </Form>
                    </Card.Body>
                    <Card.Footer className="text-center">
                        <Link className="p-2" to={"/"}>
                            Login
                        </Link>
                        <Link className="p-2" to={"/register"}>
                            Register
                        </Link>
                    </Card.Footer>
                </Card>
            </Container>
        );
    }
}
export default routeHelper(Login);