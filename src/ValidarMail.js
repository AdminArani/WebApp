import { Button, CircularProgress, Divider, Paper, TextField } from "@mui/material";
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
import { green } from "@mui/material/colors";


function ValidarMail({params}){
    const [cargando, set_cargando] = useState(false);
    const [validado, set_validado] = useState(false);
    

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
                            <Typography variant="h6" color="inherit" component="div">Volver al login</Typography>
                        </Toolbar>
                    </AppBar>
                    {/* ------------------------------- */}
                    <Box sx={{ p: 6, textAlign: 'center'}}>
                        {validado && 
                            <>
                                <Typography sx={{color: green[600]}}>Correo validado correctamente.</Typography>
                                <Button component={Link} to="/login" variant="contained" sx={{mt: 3}}>Volver al login</Button>
                            </>
                        }
                        {!validado && 
                        <>
                            <Typography sx={{mb: '2rem'}}>Estamos validando su correo electrónico, por favor espere un momento antes de continuar...</Typography>
                            <CircularProgress />
                        </>
                        }
                    </Box>
                    {/* ------------------------------- */}
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default ValidarMail;