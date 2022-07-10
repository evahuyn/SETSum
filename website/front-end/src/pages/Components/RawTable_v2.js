import React from "react";
import {Table} from 'react-bootstrap'
const RawTable = ({title, data}) =>{

    return(
        <>
            <Table striped bordered hover style={{textAlign:"left"}}>
              {/*<thead>*/}
              {/*  <tr>*/}
              {/*    /!*<th>#</th>*!/*/}
              {/*    <th>Comment {title+1}</th>*/}
              {/*  </tr>*/}
              {/*</thead>*/}
              <tbody>
              {
                Array.from(data).map((item, i) => (
                  <tr key={item.id}>
                    {/*<td>1</td>*/}
                    <td>{item.comments}</td>
                  </tr>
                ))
              }

              </tbody>
            </Table>
        </>
    )
}

export default RawTable;