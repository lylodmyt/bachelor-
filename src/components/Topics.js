import React, { Component } from "react";
import { Button, Alert, Container } from "react-bootstrap";
import axios from "axios";
import AuthService from "../services/auth-service";
import { TOPIC_API_URL } from "../helpers/paths";
import {Link, Navigate} from "react-router-dom";
import CreateTopicModal from './modals/CreateTopicModal';
import RenameTopicModal from './modals/RenameTopicModal';
import { routeHelper } from '../helpers/routeHelper';

class Topics extends Component {
    state = {
        redirect: null,
        topics: [],
        loading: true,
        error: null,
        showModal: false,
        modalType: 'topic',
        parentId: null,
        showRenameModal: false,
        topicId: null,
        topicTitle: null,
    };

    componentDidMount() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            this.setState({ redirect: '/' });
        } else {
            this.fetchTopics();
        }
    }

    fetchTopics = () => {
        this.setState({ loading: true, error: null });
        const { token, username } = AuthService.getCurrentUser();
        axios
            .get(`${TOPIC_API_URL}parent/${username}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                this.setState({ topics: response.data, loading: false });
            })
            .catch((error) => {
                console.error('Error fetching tests:', error);
                this.setState({ loading: false, error: 'Error fetching tests' });
            });
    };

    handleOpenCreateModal = (type, id) => {
        this.setState({
            showModal: true,
            modalType: type,
            parentId: id,
        });
    };

    handleCloseCreateModal = () => {
        this.setState({
            showModal: false,
            modalType: 'topic',
        });
    };

    handleOpenRenameModal = (id, title) => {
        this.setState({
            showRenameModal: true,
            topicId: id,
            topicTitle: title,
        });
    };

    handleCloseRenameModal = () => {
        this.setState({
            showRenameModal: false,
            topicTitle: null,
        });
    };

    handleDeleteTopic = (id) => {
        axios
            .delete(`${TOPIC_API_URL}delete/${id}`, {
                headers: { Authorization: `Bearer ${AuthService.getCurrentUser().token}` },
            })
            .then((response) => {
                this.fetchTopics();
            })
            .catch((error) => {
                console.error('Error deleting test:', error);
            });
    };
    render() {
        if (this.state.redirect) {
            return <Navigate to={this.state.redirect}/>
        }
        const { topics, loading, error } = this.state;

        if (!loading && topics.length === 0) {
            return (
                <Container>
                    <div className="mb-2">
                        <span className="h2">Topics:</span>
                        <Button className="float-right" variant="primary" onClick={() => this.handleOpenCreateModal("topic")}>Create topic</Button>
                    </div>
                    <Alert className="alert-warning">
                        No test to display.
                    </Alert>
                    <CreateTopicModal
                        show={this.state.showModal}
                        onHide={this.handleCloseCreateModal}
                        type={this.state.modalType}
                        parentId={this.state.parentId}
                        fetchTopics={this.fetchTopics.bind(this)}
                    />
                </Container>
            );
        }

        return (
            <Container>
                <div className="mb-2">
                    <span className="h2">Topics:</span>
                    <Button
                        className="float-right"
                        variant="primary"
                        onClick={() => this.handleOpenCreateModal("topic")}
                    >
                        Create topic
                    </Button>
                </div>
                {topics.map((topic) => (
                    <ul key={topic.id} className="mb-2">
                        <li>
                            <Link to={`/questions/${topic.id}`} className="mr-2">
                                {topic.title}
                            </Link>
                            <Button
                                className="btn-sm mr-2"
                                variant="primary"
                                onClick={() => this.handleOpenCreateModal("subtopic", topic.id)}
                            >
                                Add subtopic
                            </Button>
                            <Button
                                className="btn-sm mr-2"
                                variant="warning"
                                onClick={() => this.handleOpenRenameModal(topic.id, topic.title)}
                            >
                                Rename
                            </Button>
                            <Button
                                className="btn-sm mr-2"
                                disabled={topic.subTopics.length > 0}
                                variant="danger"
                                onClick={() => this.handleDeleteTopic(topic.id)}
                            >
                                Delete
                            </Button>
                        </li>
                        {topic.subTopics.map((sub) => (
                            <li key={sub.id} className="m-3 ml-5">
                                <Link to={`/questions/${sub.id}`} className="mr-2">
                                    {sub.title}
                                </Link>
                                <Button
                                    className="btn-sm mr-2"
                                    variant="warning"
                                    onClick={() => this.handleOpenRenameModal(sub.id, sub.title)}
                                >
                                    Rename
                                </Button>
                                <Button
                                    className="btn-sm mr-2"
                                    variant="danger"
                                    onClick={() => this.handleDeleteTopic(sub.id)}
                                >
                                    Delete
                                </Button>
                            </li>
                        ))}
                    </ul>
                ))}
                {error && (
                    <Alert className="alert-danger">
                        {error}
                    </Alert>
                )}
                <CreateTopicModal
                    show={this.state.showModal}
                    onHide={this.handleCloseCreateModal}
                    type={this.state.modalType}
                    parentId={this.state.parentId}
                    fetchTopics={this.fetchTopics.bind(this)}
                />
                <RenameTopicModal
                    show={this.state.showRenameModal}
                    onHide={this.handleCloseRenameModal}
                    topicId={this.state.topicId}
                    fetchTopics={this.fetchTopics.bind(this)}
                    initialTitle={this.state.topicTitle}
                />
            </Container>
        );
    }
}

export default routeHelper(Topics);
