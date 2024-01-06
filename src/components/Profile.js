import React, { Component } from "react";
import { Button, ButtonGroup, Container } from "react-bootstrap";
import AuthService from "../services/auth-service";
import ReportModal from "./modals/ReportModal";
import PasswordModal from "./modals/PasswordModal";

class Profile extends Component {
    state = {
        currentUser: AuthService.getCurrentUser(),
        isPasswordModalOpen: false,
        isReportModalOpen: false,
    };

    toggleModal = (modalType) => {
        this.setState((prevState) => ({
            [modalType]: !prevState[modalType],
        }));
    };

    render() {
        const { currentUser, isPasswordModalOpen, isReportModalOpen } = this.state;

        return (
            <Container>
                <div>
                    <h1>Welcome {currentUser.username}</h1>
                </div>
                <div>
                    <ButtonGroup vertical>
                        <Button
                            type="primary"
                            className="mb-2"
                            onClick={() => this.toggleModal("isPasswordModalOpen")}
                        >
                            Change password
                        </Button>
                        <Button
                            type="primary"
                            className="mb-2"
                            onClick={() => this.toggleModal("isReportModalOpen")}
                        >
                            Create report
                        </Button>
                    </ButtonGroup>
                </div>
                <ReportModal
                    show={isReportModalOpen}
                    onHide={() => this.toggleModal("isReportModalOpen")}
                />
                <PasswordModal
                    show={isPasswordModalOpen}
                    onHide={() => this.toggleModal("isPasswordModalOpen")}
                />
            </Container>
        );
    }
}

export default Profile;
