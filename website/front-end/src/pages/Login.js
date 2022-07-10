import React, { useState } from 'react';
import {signin} from "../service/auth"
import Alert from 'react-popup-alert'
import {alertStyle, buttonStyle} from "./Components/alert";
import {useNavigate} from "react-router-dom";

function Login(props) {
  const username = useFormInput('');
  const password = useFormInput('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // add popup alert
  const [alert, setAlert] = React.useState({
    type: 'error',
    text: 'This is a alert message',
    show: false
  })

  function onCloseAlert() {
    setAlert({
      type: '',
      text: '',
      show: false
    })
  }

  function onShowAlert(type, error) {
    setAlert({
      type: type,
      text: error,
      show: true
    })
  }

  const handleLogin = async () => {
    try {
      let a = await signin(username.value, password.value);
      sessionStorage.setItem('uid', a.id);
      sessionStorage.setItem('username', a.username);
      navigate('/home');
    } catch (error) {
      setError("Incorrect password or username");
      onShowAlert('User Login in Error', error.toString())
    }
  }

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginTop:"30vh",
  }

  const loginBoxStyle = {
    backgroundColor: "#4B9CD3",
    padding: "2em",
    borderRadius: "1em"
  }

  const buttonStyle = {
    backgroundColor: "#fff9da",
    width: "10rem"
  }

  const inputStyle = {
    borderRadius: "0.3em",
    padding: "0.3em",
    width: "15em",
    borderColor: "white",
    textAlign: "center"
  }

  return (
    <div style={containerStyle}>
      <div style={loginBoxStyle}>
        <h3 style={{marginBottom: "1.5rem"}}>SETSum Website Login</h3>
        <div>
          <input type="text" {...username} autoComplete="new-password" placeholder={"Username"} style={inputStyle} />
        </div>
        <div style={{ marginTop: 15 }}>
          <input type="password" {...password} autoComplete="new-password" placeholder={"Password"} style={inputStyle} />
        </div>
      {error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br />
      <input type="button" value={'LOGIN'} onClick={handleLogin}
             className={"btn btn-default button-cadetblue"}
             style={buttonStyle}/><br />

      </div>

      <Alert
        header={'Please check whether you are using a valid user account!'}
        btnText={'Close'}
        text={alert.text}
        type={alert.type}
        show={alert.show}
        onClosePress={onCloseAlert}
        pressCloseOnOutsideClick={true}
        showBorderBottom={true}
        alertStyles={alertStyle}
        headerStyles={{}}
        textStyles={{}}
        buttonStyles={buttonStyle}
      />
    </div>
  );
}

const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);

  const handleChange = e => {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  }
}

export default Login;
