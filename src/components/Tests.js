import React, { Component } from "react";
import { Button, ButtonGroup, Card, Container } from "react-bootstrap";
import AuthService from "../services/auth-service";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import { TEST_API_URL } from "../helpers/paths";
import { routeHelper } from "../helpers/routeHelper";
import CreateTestModal from "./modals/CreateTestModal";

class Tests extends Component {
    state = {
        redirect: null,
        tests: [],
        loading: true,
        error: null,
        quizStarted: false,
        testId: null,
        isCreateTestModalOpen: false,
    };

    componentDidMount() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            this.setState({ redirect: "/" });
        } else {
            this.fetchTests();
        }
    }

    fetchTests = () => {
        this.setState({ loading: true, error: null });
        const { token, username } = AuthService.getCurrentUser();
        axios
            .get(`${TEST_API_URL}user/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                console.log(response.data);
                this.setState({ tests: response.data, loading: false });
            })
            .catch((error) => {
                console.error("Error fetching tests:", error);
                this.setState({ loading: false, error: "Error fetching tests" });
            });
    };

    handleRunTest = (id) => {
        this.props.router.navigate(`/quiz/${id}`);
    };

    handleEditTest = (id) => {
        this.props.router.navigate(`/test/${id}`);
    };

    handleDeleteTest = (id) => {
        axios
            .delete(`${TEST_API_URL}delete/${id}`, {
                headers: { Authorization: `Bearer ${AuthService.getCurrentUser().token}` },
            })
            .then((response) => {
                console.log("Test deleted:", response.data);
                this.fetchTests();
            })
            .catch((error) => {
                console.error("Error deleting test:", error);
            });
    };

    handleUpdateTest = (id, title, publish) => {
        const testDto = {
            id,
            title,
            published: publish,
        };

        axios
            .put(`${TEST_API_URL}update`, testDto, {
                headers: { Authorization: `Bearer ${AuthService.getCurrentUser().token}` },
            })
            .then((response) => {
                console.log("Test updated:", response.data);
                this.fetchTests();
            })
            .catch((error) => {
                console.error("Error updating test:", error);
            });
    };

    handleOpenModal = () => {
        this.setState({ isCreateTestModalOpen: true });
    };

    handleCloseModal = () => {
        this.setState({ isCreateTestModalOpen: false });
    };

    render() {
        const { redirect, tests, loading, error, isCreateTestModalOpen } = this.state;

        if (redirect) {
            return <Navigate to={redirect} />;
        }

        const createTestModal = (
            <CreateTestModal
                show={isCreateTestModalOpen}
                onHide={this.handleCloseModal}
                fetchTopics={this.fetchTests}
            />
        );

        const noTestsMessage = (
            <Container>
                <div className="mb-2">
                    <span className="h2">Tests:</span>
                    <Button className="float-right" variant="primary" onClick={this.handleOpenModal}>
                        Create test
                    </Button>
                </div>
                <Alert className="alert-warning">No test to display.</Alert>
                {isCreateTestModalOpen && createTestModal}
            </Container>
        );

        const renderTests = (
            <Container>
                <div className="mb-2">
                    <span className="h2">Tests:</span>
                    <Button className="float-right" variant="primary" onClick={this.handleOpenModal}>
                        Create test
                    </Button>
                </div>
                <div>
                    {tests.map((test) => (
                        <Card key={test.id} className="mb-2">
                            <Card.Body>
                                <Card.Title className="float-left">{test.title}</Card.Title>
                                <ButtonGroup className="float-right">
                                    <Button disabled={test.testQuestionDtoList.length === 0} variant="success" onClick={() => this.handleRunTest(test.id)}>
                                        Run
                                    </Button>
                                    <Button variant="primary" onClick={() => this.handleEditTest(test.id)}>
                                        Edit
                                    </Button>
                                    <Button variant="danger" onClick={() => this.handleDeleteTest(test.id)}>
                                        Delete
                                    </Button>
                                    {test.published === false ? (
                                        <Button variant="warning" onClick={() => this.handleUpdateTest(test.id, test.title, true)}>
                                            Publish
                                        </Button>
                                    ) : (
                                        <Button variant="warning" onClick={() => this.handleUpdateTest(test.id, test.title, false)}>
                                            Unpublish
                                        </Button>
                                    )}
                                </ButtonGroup>
                            </Card.Body>
                        </Card>
                    ))}
                    {error && <Alert className="alert-danger">{error}</Alert>}
                </div>
                {isCreateTestModalOpen && createTestModal}
            </Container>
        );

        return tests.length === 0 ? noTestsMessage : renderTests;
    }
}

export default routeHelper(Tests);
