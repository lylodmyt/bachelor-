import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import axios from "axios";
import AuthService from "../../services/auth-service";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { TOPIC_API_URL } from "../../helpers/paths";

const required = (val) => {
    if (!val) {
        return <Alert className="alert-danger">This field is required</Alert>;
    }
};

class RenameTopicModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.initialTitle,
            message: "",
            successful: false,
        };
    }

    handleClose = () => {
        this.setState({
            title: "",
            message: "",
            successful: false,
        });
        this.props.fetchTopics();
        this.props.onHide();
    };

    handleRenameTopic = (e) => {
        e.preventDefault();

        this.setState({
            message: "",
            successful: false,
        });

        this.form.validateAll();
        if (this.checkBtn.context._errors.length === 0) {
            const topicDto = {
                id: this.props.topicId,
                title: this.state.title,
            };

            axios
                .put(TOPIC_API_URL + `rename`, topicDto, {
                    headers: {
                        Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                    },
                })
                .then(
                    (res) => {
                        this.setState({
                            message: res.data.message,
                            successful: true,
                        });
                        this.handleClose();
                    },
                    (error) => {
                        const responseMessage =
                            (error.response &&
                                error.response.data &&
                                error.response.data.message) ||
                            error.message ||
                            error.toString();

                        this.setState({
                            successful: false,
                            message: responseMessage,
                        });
                    }
                );
        }
    };

    render() {
        console.log(this.props.initialTitle);
        return (
            <Modal show={this.props.show} onHide={this.handleClose} size="lg" centered>
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">Rename Topic</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => this.handleRenameTopic(e)} ref={(c) => (this.form = c)}>
                        {this.state.successful && this.state.message && (
                            <Alert className="alert-success">{this.state.message}</Alert>
                        )}
                        {!this.state.successful && this.state.message && (
                            <Alert className="alert-danger">{this.state.message}</Alert>
                        )}
                        <div className="form-group">
                            <label htmlFor="title">New Title for: {this.props.initialTitle}</label>
                            <Input
                                type="text"
                                name="title"
                                onChange={(e) => this.setState({title: e.target.value})}
                                validations={[required]}
                                className="form-control mb-2"
                            />
                        </div>
                        <button disabled={this.state.successful} className="btn btn-primary">
                            Rename
                        </button>
                        <CheckButton
                            style={{display: "none"}}
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

export default RenameTopicModal;
