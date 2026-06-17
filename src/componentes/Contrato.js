// import logoArani from "./images/logoarani.png";
import { Button, Dialog, DialogContent, useMediaQuery, DialogTitle, DialogActions, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
// import axios from "axios";
import { AppContext } from "../App";
import axios from "axios";
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import 'dayjs/locale/es';
// import moment from "moment";
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTheme } from "@emotion/react";
import parse from "html-react-parser";
import config from "../config";

function Contrato({open, onClose}){
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [dataContrato, set_dataContrato] = useState(false);
    const [cargandoC, set_cargandoC] = useState(false);
    const gContext = useContext(AppContext);

    // Dispara getContrato() cuando el modal se abre
    useEffect(()=>{
        if(open){
            getContrato();
        }
        // eslint-disable-next-line
    }, [open]);

    function getProfile(){
        // Primero obtener el perfil para conseguir customer_id
        return axios.request({
            url: `${config.apiUrl}/api/app/getProfile.php`,
            method: "post",
            data: {
                sid: gContext.logeado?.token,
            },
        })
        .then((res) => {
            if(res.data.status === "OK"){
                return res.data.payload?.data;
            }else{
                throw new Error('Error al cargar perfil');
            }
        });
    }

    function getContrato(){
        // Primero obtener el perfil para conseguir customer_id
        getProfile()
        .then((profileData) => {
            const customerId = profileData?.customer_id;
            
            if(!customerId){
                set_dataContrato(false);
                return;
            }
            
            // Ahora llamar al endpoint del contrato con customer_id
            axios.request({
                url: `${config.apiUrl}/api/app/get_contractCustomerId.php`,
                method: "post",
                params: {
                    customerId: customerId,
                },
            })
            .then((res) => {
                if(res.data.status === "OK"){
                    if(res.data.payload?.document_content){
                        set_dataContrato(res.data.payload);
                    }else{
                        set_dataContrato(false);
                    }
                }else{
                    set_dataContrato(false);
                }
            }).catch(err => {
                set_dataContrato(false);
            });
        })
        .catch(err => {
            set_dataContrato(false);
        });
    }

    return (
        <Dialog fullScreen={fullScreen} open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
            <DialogTitle>Contrato de préstamo</DialogTitle>
            <DialogContent dividers>
                {cargandoC && <Typography sx={{textAlign: 'center', m: '4rem auto'}}>Cargando....</Typography>}
                {!cargandoC && dataContrato?.document_content &&
                <div>
                    {parse(dataContrato.document_content+"")}
                </div>
                }
                {!cargandoC && !dataContrato?.document_content && (
                    <Typography sx={{textAlign: 'center', m: '4rem auto'}}>Cargando...</Typography>
                )}
                
            </DialogContent>
            <DialogActions sx={{justifyContent: 'flex-start'}}>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
      </Dialog>
    );
}


export default Contrato;


