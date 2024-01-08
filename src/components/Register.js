import React, { Component } from "react";
import { Card, Container, Alert } from "react-bootstrap";
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import AuthService from "../services/auth-service";
import { Link } from "react-router-dom";

const required = val => {
    if (!val) {
        return (
            <Alert className="alert-danger">
                This field is required
            </Alert>
        );
    }
}

const validEmail = value => {
    if (!isEmail(value)) {
        return (
            <Alert className="alert-danger">
                This is not a valid email.
            </Alert>
        );
    }
}

const validUsername = value => {
    if (value.length < 3 || value.length > 20) {
        return (
            <Alert className="alert-danger">
                Username must be between 3 and 20 characters.
            </Alert>
        );
    }
}

const validPassword = value => {
    if (value.length < 6) {
        return (
            <Alert className="alert-danger">
                Password must have more than 6 characters.
            </Alert>
        );
    }
}

const matchPassword = (value, props, components) => {
    const password = components.password[0].value;
    if (password !== value) {
        return (
            <Alert className="alert-danger">
                Passwords do not match.
            </Alert>
        );
    }
};

class Register extends Component {

    state = {
        username: '',
        email: '',
        password: '',
        password2: '',
        successful: false,
        message: ''
    };

    onChangeField = (field, e) => {
        this.setState({
            [field]: e.target.value
        });
    }

    handleRegister = (e) => {
        e.preventDefault();
        this.setState({
            message: '',
            successful: false
        });

        this.form.validateAll();
        if (this.checkBtn.context._errors.length === 0) {
            const { username, email, password } = this.state;
            AuthService.register(username, email, password)
                .then(
                    (res) => {
                        this.setState({
                            message: res.data.message,
                            successful: true
                        });
                    },
                    (error) => {
                        const responseMessage = (error.response && error.response.data && error.response.data.message)
                            || error.message
                            || error.toString();

                        this.setState({
                            successful: false,
                            message: responseMessage
                        });
                    }
                );
        }
    }

    render() {
        const { successful, message } = this.state;

        return (
            <Container>
                <section className="jumbotron jumbotron-fluid text-center">
                    <div className="container">
                        <h1 className="jumbotron-heading">TestQuiz</h1>
                        <p className="lead text-muted">Application for creating and running your tests</p>
                    </div>
                </section>
                <Card className="mb-5">
                    <Card.Header className="text-center">
                        <h3>Registration</h3>
                    </Card.Header>
                    <Card.Body>
                        <Form className="container" onSubmit={this.handleRegister} ref={c => { this.form = c }}>
                            {successful && (
                                <Alert className="alert-success">
                                    {message}
                                </Alert>
                            )}
                            {!successful && message && (
                                <Alert className="alert-danger">
                                    {message}
                                </Alert>
                            )}
                            <div className="form-group">
                                <Input
                                    type="text"
                                    name="username"
                                    value={this.state.username}
                                    onChange={(e) => this.onChangeField('username', e)}
                                    validations={[required, validUsername]}
                                    className="form-control mb-2"
                                    placeholder="Username"
                                />
                            </div>
                            <div className="form-group">
                                <Input
                                    type="text"
                                    name="email"
                                    value={this.state.email}
                                    onChange={(e) => this.onChangeField('email', e)}
                                    validations={[required, validEmail]}
                                    className="form-control mb-2"
                                    placeholder="Email"
                                />
                            </div>
                            <div className="form-group">
                                <Input
                                    type="password"
                                    name="password"
                                    value={this.state.password}
                                    onChange={(e) => this.onChangeField('password', e)}
                                    validations={[required, validPassword]}
                                    className="form-control mb-2"
                                    placeholder="Password"
                                />
                            </div>
                            <div className="form-group">
                                <Input
                                    type="password"
                                    name="passwordRepeat"
                                    value={this.state.password2}
                                    onChange={(e) => this.onChangeField('password2', e)}
                                    validations={[required, matchPassword]}
                                    className="form-control mb-2"
                                    placeholder="Repeat password"
                                />
                            </div>
                            <div className="form-group text-center">
                                <button className="btn btn-primary">Register</button>
                                <CheckButton
                                    style={{ display: "none" }}
                                    ref={c => {
                                        this.checkBtn = c;
                                    }}
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
export default Register;
