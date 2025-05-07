import config from '../config';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Button, Typography, Box, Grid} from "@mui/material";
import logoArani from '../images/selfie.jpeg';

//Editar  Archivo 4
function FormEditFile4({reiniciarpantalla, usuarioFiles}){
    const gContext = useContext(AppContext);
    
    const [imageFiles4, set_imageFiles4] = useState(false);

    useEffect(()=>{
        console.log('usuarioFiles', usuarioFiles);
        
        let t18 = usuarioFiles.find(e=>e.type === "18");
        if(t18?.dir) set_imageFiles4(`${config.apiUrl}${t18?.dir}`);

        // eslint-disable-next-line
    }, []);

    

    const [cargandoArchivo4, set_cargandoArchivo4] = useState(false);
    const [subidoArchivo4, set_subidoArchivo4] = useState(false);
    const [imagendata4, set_imagendata4] = useState(false);
    function enviarArchivo4(e){
        console.log('event',e);

        let file = e.target.files[0];
        set_imagendata4(URL.createObjectURL(e.target.files[0]));
        
        const formData = new FormData();
        formData.append('file4', file);
        formData.append('sid', gContext.logeado?.token);

        set_cargandoArchivo4(true);
        axios.post(`${config.apiUrl}/api/app/putProfileFile.php`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        }).then((res) => {
            set_cargandoArchivo4(false);
            if(res.data.status === "ER"){
            }
            // if(res.data.status === "ERS"){
            //     localStorage.removeItem('arani_session_id');
            //     gContext.set_logeado({estado: false, token: ''});
            // }
            if(res.data.status === "OK"){
                set_subidoArchivo4(true);
                // reiniciarpantalla();
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    return (
        <Box>
    <Typography variant="h5" sx={{}}>Foto selfie</Typography>
    <br />
    <Typography variant="body1" sx={{ mb: '1rem', textAlign: 'justify' }}>
        Sube una foto selfie que servirá como tu foto de perfil. Asegúrate de que la foto sea a color, muestres tu DNI, y aparezca todo tu rostro y cabello. No uses gorra, sombrero ni lentes de sol. <br /><br /><strong>Las fotos que no cumplan con estas condiciones no serán aceptadas</strong>.
    </Typography>

    <Grid sx={{ mt: 1, mb: 1 }} container spacing={2} alignItems="stretch">
        <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            {subidoArchivo4 && (
                <Typography sx={{ textAlign: 'center', color: '#5aad55' }}>
                    Se subió correctamente
                </Typography>
            )}
            {(subidoArchivo4 || imageFiles4) && (
                <img
                    className="imgprevperfil"
                    src={imagendata4 || imageFiles4}
                    alt="preview"
                    style={{ width: '100%', height: 'auto', flexGrow: 1 }}
                />
            )}
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <img
                src={logoArani} // Usa la imagen importada
                alt="Logo Arani"
                style={{ width: '100%', height: 'auto', flexGrow: 1 }}
            />
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
                fullWidth
                disabled={cargandoArchivo4 || subidoArchivo4}
                variant="contained"
                component="label"
                startIcon={
                    <span className="material-symbols-outlined">cloud_upload</span>
                }
            >
                {cargandoArchivo4 ? 'Subiendo...' : 'Foto de perfil'}
                <input
                    hidden
                    onChange={enviarArchivo4}
                    accept="image/*"
                    multiple
                    type="file"
                />
            </Button>
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button onClick={reiniciarpantalla} sx={{ mt: 1, mr: 1 }}>
                Cerrar
            </Button>
        </Grid>
    </Grid>
</Box>
    )
}

export default FormEditFile4;