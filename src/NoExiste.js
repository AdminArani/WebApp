import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import { Container } from "@mui/system";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Link } from "react-router-dom";
import BarraFinal from "./componentes/BarraFinal";



function NoExiste(){
    
    return (
        <Container disableGutters sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"    }} component="main" maxWidth="sm">
            <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", p: '4px'}}>
                <Paper>
                    {/* ------------------------------- */}
                    <AppBar sx={{borderRadius: "0.5rem 0.5rem 0 0"}} position="static">
                        <Toolbar>
                            <IconButton component={Link} to="/" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                                <span className="material-symbols-outlined">arrow_back</span>
                            </IconButton>
                            <Typography variant="h6" color="inherit" component="div">Error</Typography>
                        </Toolbar>
                    </AppBar>
                    {/* ------------------------------- */}
                    <Box sx={{ p: 6 }}>
                        <Typography>La página a la que intenta acceder no existe.</Typography>
                    </Box>
                    {/* ------------------------------- */}
                </Paper>
                <BarraFinal />
            </Box>
        </Container>
    );
}

export default NoExiste;