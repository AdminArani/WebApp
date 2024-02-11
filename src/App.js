import { Routes, Route, HashRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import RecuperarPass from './RecuperarPass.js';
import CambiarPass from './CambiarPass.js';
import Main from './Main.js';
import Registro from './Registro.js';
import Perfil from './Perfil.js';
import Login from './Login.js';
import Aplicar from './Aplicar.js';
import Plan from './Plan.js';
import NoExiste from './NoExiste.js';
import Historial from './Historial.js';
import ValidarMail from './ValidarMail.js';
import './App.css';

export const AppContext = createContext();

// Actualizador de versiones en el cliente
// ----------------------------------------------
// ----------------------------------------------
var versionJS = '0.3.0';

setInterval(() => { 
        var time = new Date().getTime();
        axios.request({
                url: "./versionjs.txt?v="+time,
                method: "get"
        }).then(res=>{
                if(res.data !== versionJS){
                        window.location = '#/login';
                        alert('Nueva versión disponible ('+res.data+'), la aplicación se reiniciará automáticamente.');
                        window.location.reload();
                }else{
                        // -------
                }
        }).catch(err => {
             // error
        });
}, 30000);
// ----------------------------------------------
// ----------------------------------------------



const theme = createTheme({
    shape: {
        borderRadius: 10,
    }, 
    typography: {
        fontSize: 16,
        fontFamily: [
            "Urbanist",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
    },
    palette: {
        primary: {
            main: "#4c74e9",
        }
    },
});

function App() {
    const [logeado, set_logeado] = useState({estado: false, token: ''});
    
    useEffect(()=>{ // Procesamos la session logeado en localstorage y estado
        let arani_session_id = localStorage.getItem('arani_session_id') || false;
        if(arani_session_id){
            set_logeado({estado: true, token: arani_session_id});
        }
    },[]);

    return (
        <div className={"App"}>
            <AppContext.Provider value={{logeado, set_logeado, versionJS}}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <HashRouter>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/recuperarpass" element={<RecuperarPass />} />
                            <Route path="/recuperarpass/:data" element={<CambiarPass />} />
                            <Route path="/registro" element={<Registro />} />
                            <Route path="/" element={(logeado.estado)?<Main />:<Login />} />
                            <Route path="/perfil" element={(logeado.estado)?<Perfil />:<Login />} />
                            <Route path="/aplicar" element={(logeado.estado)?<Aplicar />:<Login />} />
                            <Route path="/plan" element={(logeado.estado)?<Plan />:<Login />} />
                            <Route path="/plan/:idprestamoparam" element={(logeado.estado)?<Plan />:<Login />} />
                            <Route path="/historial" element={(logeado.estado)?<Historial />:<Login />} />
                            <Route path="/validarmail/:token" element={<ValidarMail />} />
                            <Route path="*" element={<NoExiste />} />
                        </Routes>
                    </HashRouter>
                </ThemeProvider>
            </AppContext.Provider>
        </div>
    );
}

export default App;
