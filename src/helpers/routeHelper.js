import { useLocation, useNavigate, useParams } from "react-router-dom";

export const routeHelper = (Component) => {
    function ComponentRouteHelperProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        return <Component {...props} router={{ location, navigate, params }} />;
    }
    return ComponentRouteHelperProp;
};