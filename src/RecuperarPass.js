import { Button, Paper, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import { Container } from "@mui/system";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import BarraFinal from "./componentes/BarraFinal";
// import logoArani from "./images/logoarani_blanco.png";
import logoArani from "./images/logoarani.png";


function RecuperarPass(){
    const [msgErrorForm, set_msgErrorForm] = useState("");
    const [cargando, set_cargando] = useState(false);
    const [passCambiado, set_passCambiado] = useState(false);

    function handleSubmit(event){
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // set_msgErrorForm("Click");
        set_cargando(true);
        axios
        .request({
            url: "https://app.arani.hn/api/app/recovery.php",
            method: "post",
            withCredentials: true,
            data: {
            UsrMail : data.get("email"),
            },
        })
        .then((res) => {
            console.log(res);
            set_cargando(false);
            if(res.data.status === "ER"){
                set_msgErrorForm(
                    <Typography variant="body2" sx={{ color: "red", pt: 0, textAlign: "center", fontSize: "0.9rem", mt: 2, mb: 0}}>
                        {res.data.payload.message}
                    </Typography>
                );
            }
            if(res.data.status === "OK"){
                set_passCambiado(true);
                set_msgErrorForm(
                    <Typography variant="body2" sx={{ color: "green", pt: 0, textAlign: "center", fontSize: "0.9rem", mt: 2, mb: 0}}>
                        {res.data.payload.message}
                    </Typography>
                );
            }
        }).catch(err => {
            // console.log(err);
            set_cargando(false);
            set_msgErrorForm(
                <Typography variant="body2" sx={{ color: "red", pt: 0, textAlign: "center", fontSize: "0.9rem", mt: 2, mb: 0}}>
                    {err.message}
                </Typography>
            );
        });

        return false;
    }

    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"    }} component="main" maxWidth="sm">
            <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", p: '4px'}}>
                <Box sx={{textAlign: 'center', pt: 2, pb: 5}}>
                    <img style={{ maxHeight: "5rem" }} alt="Logo Arani" src={logoArani} />
                </Box>
                <Paper>
                    {/* ------------------------------- */}
                    <AppBar sx={{borderRadius: "0.5rem 0.5rem 0 0"}} position="static">
                        <Toolbar>
                            <IconButton component={Link} to="/login" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                                <span className="material-symbols-outlined">arrow_back</span>
                            </IconButton>
                            <Typography variant="h6" color="inherit" component="div">Recuperar contraseña</Typography>
                        </Toolbar>
                    </AppBar>
                    {/* ------------------------------- */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ p: 6 }}>
                        <Typography>Para recuperar su contraseña solo tiene que ingresar su correo electrónico y presionar "Recuperar", su nueva contraseña sera enviada a su correo.</Typography>
                        <TextField margin="normal" required fullWidth id="email" label="Correo" name="email" autoComplete="email" />
                        {msgErrorForm}
                        {passCambiado && <Button component={Link} to="/login" fullWidth variant="contained" size="large" sx={{ mt: 2, mb: 2 }} >Volver a formulario de inicio</Button>}
                        {!passCambiado && <Button type="submit" disabled={cargando} fullWidth variant="contained" size="large" sx={{ mt: 2, mb: 2 }} >{(cargando)?"Cargando":"Recuperar"}</Button>}
                    </Box>
                    {/* ------------------------------- */}
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default RecuperarPass;