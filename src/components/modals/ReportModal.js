import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import axios from "axios";
import { REPORT_API_URL } from "../../helpers/paths";
import AuthService from "../../services/auth-service";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Textarea from 'react-validation/build/textarea';
import Alert from "react-bootstrap/Alert";

const required = (val) => {
    if (!val) {
        return <Alert className="alert-danger">This field is required</Alert>;
    }
};

class ReportModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            repTitle: "",
            repText: "",
            message: "",
            successful: false,
        };
    }

    handleClose = () => {
        this.setState({
            repTitle: "",
            repText: "",
            message: "",
            successful: false,
        });
        this.props.onHide();
    };

    handleReport = (e) => {
        e.preventDefault();

        this.setState({
            message: "",
            successful: false,
        });

        this.form.validateAll();
        if (this.checkBtn.context._errors.length === 0) {
            const reportDto = {
                title: this.state.repTitle,
                text: this.state.repText,
                username: AuthService.getCurrentUser().username,
            };

            axios
                .post(REPORT_API_URL + "create", reportDto, {
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
                    <Modal.Title id="contained-modal-title-vcenter">Report Modal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleReport} ref={(c) => (this.form = c)}>
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
                            <label htmlFor="repTitle">Title</label>
                            <Input
                                type="text"
                                name="repTitle"
                                value={this.state.repTitle}
                                onChange={(e) => this.setState({ repTitle: e.target.value })}
                                validations={[required]}
                                className="form-control mb-2"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="repText">Description</label>
                            <Textarea
                                type="text"
                                name="repText"
                                value={this.state.repText}
                                onChange={(e) => this.setState({ repText: e.target.value })}
                                validations={[required]}
                                className="form-control mb-2"
                            />
                        </div>
                        <button disabled={this.state.successful} className="btn btn-primary">
                            Send report
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

export default ReportModal;

