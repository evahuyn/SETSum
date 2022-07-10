import React from "react";
import {Table} from 'react-bootstrap'
const RawTable = ({data}) =>{

    return(
        <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  {/*<th>#</th>*/}
                  <th>Comment Sentences</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
              {
                Array.from(data).map((item, i) => (
                  <tr key={item+i}>
                    {/*<td>1</td>*/}
                    <td style={{textAlign: "left"}}>{item.comments}</td>
                    <td style={{color: item.color}}>{item.sentiment}</td>
                  </tr>
                ))
              }

              </tbody>
            </Table>
        </>
    )
}

export default RawTable;