import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import axios from "axios";
import { USER_API_URL } from "../../helpers/paths";
import AuthService from "../../services/auth-service";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

const required = (val) => {
    if (!val) {
        return <Alert className="alert-danger">This field is required</Alert>;
    }
};

const matchPassword = (value, props, components) => {
    const password = components.password1[0].value;
    if (password !== value) {
        return (
            <Alert className="alert-danger">
                Passwords do not match.
            </Alert>
        );
    }
};

const validPassword = value => {
    if (value.length < 6){
        return (
            <Alert className="alert-danger">
                Password must have more than 6 characters.
            </Alert>
        );
    }
}

class PasswordModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password1: "",
            password2: "",
            message: "",
            loading: false,
        };
    }

    // Reset state and close modal
    handleClose = () => {
        this.setState({
            password1: "",
            password2: "",
            message: "",
            loading: false,
        });
        this.props.onHide();
    };

    handleChangePassword = (e) => {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true,
        });

        this.form.validateAll();
        if (this.checkBtn.context._errors.length === 0) {
            const userDto = AuthService.getCurrentUser();
            userDto.password = this.state.password1;

            axios
                .put(USER_API_URL + "changepass", userDto, {
                    headers: {
                        Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                    },
                })
                .then(res => {
                        this.setState({
                            message: res.data.message,
                            successful: true
                        });
                    },
                    error => {
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
        return (
            <Modal {...this.props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleChangePassword} ref={(c) => (this.form = c)}>
                        {this.state.successful && this.state.message && (
                            <Alert className="alert-success">
                                {this.state.message}
                            </Alert>
                        )}
                        {!this.state.successful && this.state.message && (
                            <Alert className="alert-danger">
                                {this.state.message}
                            </Alert>
                        )}
                        <div className="form-group">
                            <label htmlFor="password1">New password</label>
                            <Input
                                type="password"
                                name="password1"
                                value={this.state.password1}
                                onChange={(e) => this.setState({ password1: e.target.value })}
                                validations={[required, validPassword]}
                                className="form-control mb-2"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password2">Confirm new password</label>
                            <Input
                                type="password"
                                name="password2"
                                value={this.state.password2}
                                onChange={(e) => this.setState({ password2: e.target.value })}
                                validations={[required, matchPassword]}
                                className="form-control mb-2"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={this.state.loading}>
                            Change password
                        </button>
                        <CheckButton
                            style={{ display: "none" }}
                            ref={(c) => {
                                this.checkBtn = c;
                            }}
                        />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn btn-danger" onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default PasswordModal;
