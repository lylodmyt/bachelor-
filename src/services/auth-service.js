import axios from "axios";
import {AUTH_API_URL} from "../helpers/paths";


class AuthService {
    login(username, password) {
        return axios
            .post(AUTH_API_URL + "login", {
                username,
                password
            })
            .then(response => {
                if (response.data.token) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    logout(callback){
        localStorage.removeItem("user");
        callback();
    }

    register(username, email, password){
        return axios.post(AUTH_API_URL + "register", {
            username,
            email,
            password
        });
    }

    getCurrentUser(){
        return JSON.parse(localStorage.getItem('user'));
    }
}
export default new AuthService();