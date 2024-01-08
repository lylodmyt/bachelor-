import React, { Component } from "react";
import { Card, Button, Alert, ButtonGroup, Container } from "react-bootstrap";
import axios from "axios";
import AuthService from "../services/auth-service";
import { TEST_API_URL } from "../helpers/paths";
import { Navigate } from "react-router-dom";
import { routeHelper } from "../helpers/routeHelper";

class Public extends Component {
    state = {
        redirect: null,
        tests: [],
        loading: true,
        error: null,
    };

    componentDidMount() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            this.setState({ redirect: "/" });
        } else {
            this.fetchTests();
        }
    }

    fetchTests() {
        this.setState({ loading: true, error: null });
        const { token } = AuthService.getCurrentUser();

        axios
            .get(TEST_API_URL + "published", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                this.setState({ tests: response.data, loading: false });
            })
            .catch((error) => {
                console.error("Error fetching tests:", error);
                this.setState({ loading: false, error: "Error fetching tests" });
            });
    }

    handleRunTest(id) {
        this.props.router.navigate("/quiz/" + id);
    }

    handleUpdateTest = (id, title) => {
        const testDto = {
            id,
            title,
            published: false,
        };

        axios
            .put(`${TEST_API_URL}update`, testDto, {
                headers: { Authorization: `Bearer ${AuthService.getCurrentUser().token}` },
            })
            .then((response) => {
                this.fetchTests();
            })
            .catch((error) => {
                console.error("Error updating test:", error);
            });
    };

    render() {
        const { redirect, tests, loading, error } = this.state;

        if (redirect) {
            return <Navigate to={redirect} />;
        }

        return (
            <Container>
                <h2>Public tests:</h2>
                {!loading && tests.length === 0 ? (
                    <Alert className="alert-warning">No test to display.</Alert>
                ) : (
                    tests.map((test) => (
                        <Card key={test.id} className="mb-2">
                            <Card.Body>
                                <div className="float-left">
                                    <h4>{test.title}</h4>
                                </div>
                                <ButtonGroup className="float-right">
                                    <Button
                                        variant="success"
                                        onClick={() => this.handleRunTest(test.id)}
                                    >
                                        Run
                                    </Button>
                                    {AuthService.getCurrentUser().roles[0] === "ADMIN" && (
                                        <Button
                                            variant="danger"
                                            onClick={() => this.handleUpdateTest(test.id, test.title)}
                                        >
                                            Remove from public
                                        </Button>
                                    )};
                                </ButtonGroup>
                            </Card.Body>
                            <Card.Footer>
                                Author:{" "}
                                <span className="font-weight-bold">{test.username}</span>
                            </Card.Footer>
                        </Card>
                    ))
                )}
                {error && <Alert className="alert-danger">{error}</Alert>}
            </Container>
        );
    }
}
export default routeHelper(Public);