import {Accordion} from "react-bootstrap";

const Footnote = (props) =>{
    return(
        <Accordion>
            {Array.from(props.data).map((item, idx) => (
                <Accordion.Item eventKey={idx}>
                    <Accordion.Header>{item.summary}</Accordion.Header>
                    <Accordion.Body>
                       The Original Comment: <br />
                        {item.comments}
                    </Accordion.Body>
                  </Accordion.Item>
            ))}
        </Accordion>
    )
}

export default Footnote;