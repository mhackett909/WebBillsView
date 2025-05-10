import { useParams } from "react-router-dom";

const Details = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Details Page</h1>
            <p>Selected Row ID: {id}</p>
        </div>
    );
};

export default Details;