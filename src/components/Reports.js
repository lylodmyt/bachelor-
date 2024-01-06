import React, { Component } from "react";
import {Card, Button, Alert, Container} from "react-bootstrap";
import axios from "axios";
import AuthService from "../services/auth-service";
import { ADMIN_API_URL } from "../helpers/paths";
import moment from "moment";
import {Navigate} from "react-router-dom";

class Reports extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,
            reports: [],
            loading: true,
            error: null,
        };
    }

    componentDidMount() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.roles || !currentUser.roles.includes('ADMIN')) {
            this.setState({redirect : "/"});
        } else {
            this.fetchReports();
        }
    }

    fetchReports() {
        this.setState({ loading: true, error: null });
        axios
            .get(ADMIN_API_URL + "reports", {
                headers: {
                    Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                },
            })
            .then((response) => {
                this.setState({ reports: response.data, loading: false });
            })
            .catch((error) => {
                console.error("Error fetching reports:", error);
                this.setState({ loading: false, error: "Error fetching reports" });
            });
    }

    handleDeleteReport(id) {
        axios
            .delete(ADMIN_API_URL + `delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                },
            })
            .then((response) => {
                this.fetchReports();
            })
            .catch((error) => {
                console.error("Error deleting report:", error);
            });
    }

    render() {
        if (this.state.redirect) {
            return <Navigate to={this.state.redirect}/>
        }
        const { reports, loading, error } = this.state;

        if (!loading && reports.length === 0) {
            return (
                <Container>
                    <h2>Reports:</h2>
                    <Alert className="alert-warning">
                        No reports to display.
                    </Alert>
                </Container>
            );
        }

        return (
            <Container>
                <h2>Reports:</h2>
                {reports.map((report) => (
                    <Card key={report.id} className="mb-2">
                        <Card.Header>
                            <strong>Author: {report.username}</strong>
                            <br />
                            Created at: {moment(report.date).format("YYYY-MM-DD HH:mm:ss")}
                        </Card.Header>
                        <Card.Body>
                            <Card.Title>{report.title}</Card.Title>
                            <Card.Text>{report.text}</Card.Text>
                            <Button
                                variant="danger"
                                onClick={() => this.handleDeleteReport(report.id)}
                            >
                                Delete
                            </Button>
                        </Card.Body>
                    </Card>
                ))}
                {error && (
                    <Alert className="alert-danger">
                        {error}
                    </Alert>
                )}
            </Container>
        );
    }
}
export default Reports;